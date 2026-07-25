#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, IntoVal, Symbol, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Plan {
    pub id: u64,
    pub merchant: Address,
    pub title: String,
    pub description: String,
    pub price_xlm: i128,
    pub interval_secs: u64,
    pub max_subscribers: u32,
    pub subscribers_count: u32,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Subscription {
    pub id: u64,
    pub plan_id: u64,
    pub subscriber: Address,
    pub start_time: u64,
    pub end_time: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    TreasuryAddress,
    NextPlanId,
    NextSubId,
    Plan(u64),
    Subscription(u64),
    AllPlanIds,
    UserSubscriptions(Address),
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    /// Initialize subscription contract with admin address and treasury address
    pub fn initialize(env: Env, admin: Address, treasury: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
        env.storage().instance().set(&DataKey::NextPlanId, &1u64);
        env.storage().instance().set(&DataKey::NextSubId, &1u64);
        
        let empty_plans: Vec<u64> = Vec::new(&env);
        env.storage().instance().set(&DataKey::AllPlanIds, &empty_plans);
    }

    /// Update configured treasury address
    pub fn set_treasury(env: Env, admin: Address, treasury: Address) {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Not initialized");
        stored_admin.require_auth();
        admin.require_auth();

        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
    }

    /// Create a new subscription plan
    pub fn create_plan(
        env: Env,
        merchant: Address,
        title: String,
        description: String,
        price_xlm: i128,
        interval_secs: u64,
        max_subscribers: u32,
    ) -> u64 {
        merchant.require_auth();

        if price_xlm <= 0 {
            panic!("Price must be greater than zero");
        }
        if interval_secs == 0 {
            panic!("Interval must be greater than zero");
        }

        let plan_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextPlanId)
            .unwrap_or(1);

        let plan = Plan {
            id: plan_id,
            merchant: merchant.clone(),
            title,
            description,
            price_xlm,
            interval_secs,
            max_subscribers,
            subscribers_count: 0,
            is_active: true,
        };

        // Store plan
        env.storage().persistent().set(&DataKey::Plan(plan_id), &plan);

        // Update all plan IDs index
        let mut all_plans: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllPlanIds)
            .unwrap_or_else(|| Vec::new(&env));
        all_plans.push_back(plan_id);
        env.storage().instance().set(&DataKey::AllPlanIds, &all_plans);

        // Increment next plan ID
        env.storage().instance().set(&DataKey::NextPlanId, &(plan_id + 1));

        // Emit plan creation event
        env.events().publish((symbol_short!("created"), merchant), plan_id);

        plan_id
    }

    /// Update existing subscription plan parameters
    pub fn update_plan(
        env: Env,
        plan_id: u64,
        merchant: Address,
        title: String,
        description: String,
        price_xlm: i128,
        is_active: bool,
    ) {
        merchant.require_auth();

        let mut plan: Plan = env
            .storage()
            .persistent()
            .get(&DataKey::Plan(plan_id))
            .expect("Plan not found");

        if plan.merchant != merchant {
            panic!("Unauthorized plan update");
        }

        plan.title = title;
        plan.description = description;
        plan.price_xlm = price_xlm;
        plan.is_active = is_active;

        env.storage().persistent().set(&DataKey::Plan(plan_id), &plan);

        env.events().publish((symbol_short!("updated"), merchant), plan_id);
    }

    /// Subscribe to a plan and invoke Treasury contract via inter-contract call
    pub fn subscribe(env: Env, plan_id: u64, subscriber: Address) -> u64 {
        subscriber.require_auth();

        let mut plan: Plan = env
            .storage()
            .persistent()
            .get(&DataKey::Plan(plan_id))
            .expect("Plan not found");

        if !plan.is_active {
            panic!("Plan is not active");
        }

        if plan.max_subscribers > 0 && plan.subscribers_count >= plan.max_subscribers {
            panic!("Maximum subscriber limit reached");
        }

        // Inter-contract call to Treasury contract if configured
        if let Some(treasury_address) = env.storage().instance().get::<DataKey, Address>(&DataKey::TreasuryAddress) {
            let mut args = Vec::new(&env);
            args.push_back(plan.merchant.into_val(&env));
            args.push_back(subscriber.into_val(&env));
            args.push_back(plan.price_xlm.into_val(&env));

            env.invoke_contract::<()>(
                &treasury_address,
                &Symbol::new(&env, "receive_payment"),
                args,
            );
        }

        let sub_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextSubId)
            .unwrap_or(1);

        let now = env.ledger().timestamp();
        let end_time = now + plan.interval_secs;

        let subscription = Subscription {
            id: sub_id,
            plan_id,
            subscriber: subscriber.clone(),
            start_time: now,
            end_time,
            is_active: true,
        };

        // Save subscription
        env.storage().persistent().set(&DataKey::Subscription(sub_id), &subscription);

        // Update user subscription list
        let mut user_subs: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserSubscriptions(subscriber.clone()))
            .unwrap_or_else(|| Vec::new(&env));
        user_subs.push_back(sub_id);
        env.storage().persistent().set(&DataKey::UserSubscriptions(subscriber.clone()), &user_subs);

        // Increment plan subscriber count
        plan.subscribers_count += 1;
        env.storage().persistent().set(&DataKey::Plan(plan_id), &plan);

        // Increment next sub ID
        env.storage().instance().set(&DataKey::NextSubId, &(sub_id + 1));

        // Emit subscribe event
        env.events().publish((symbol_short!("subcribe"), subscriber, plan_id), sub_id);

        sub_id
    }

    /// Cancel an active subscription
    pub fn cancel_subscription(env: Env, subscription_id: u64, subscriber: Address) {
        subscriber.require_auth();

        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&DataKey::Subscription(subscription_id))
            .expect("Subscription not found");

        if sub.subscriber != subscriber {
            panic!("Unauthorized cancellation");
        }

        if !sub.is_active {
            panic!("Subscription is already inactive");
        }

        sub.is_active = false;
        env.storage().persistent().set(&DataKey::Subscription(subscription_id), &sub);

        // Update plan subscriber count
        if let Some(mut plan) = env.storage().persistent().get::<DataKey, Plan>(&DataKey::Plan(sub.plan_id)) {
            if plan.subscribers_count > 0 {
                plan.subscribers_count -= 1;
                env.storage().persistent().set(&DataKey::Plan(sub.plan_id), &plan);
            }
        }

        env.events().publish((symbol_short!("canceled"), subscriber), subscription_id);
    }

    /// Query single plan details
    pub fn get_plan(env: Env, plan_id: u64) -> Plan {
        env.storage()
            .persistent()
            .get(&DataKey::Plan(plan_id))
            .expect("Plan not found")
    }

    /// Query all existing plans
    pub fn get_all_plans(env: Env) -> Vec<Plan> {
        let all_ids: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllPlanIds)
            .unwrap_or_else(|| Vec::new(&env));

        let mut plans: Vec<Plan> = Vec::new(&env);
        for id in all_ids.iter() {
            if let Some(plan) = env.storage().persistent().get::<DataKey, Plan>(&DataKey::Plan(id)) {
                plans.push_back(plan);
            }
        }
        plans
    }

    /// Query active subscriptions for a given subscriber
    pub fn get_user_subscriptions(env: Env, subscriber: Address) -> Vec<Subscription> {
        let sub_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserSubscriptions(subscriber))
            .unwrap_or_else(|| Vec::new(&env));

        let mut user_subs: Vec<Subscription> = Vec::new(&env);
        for id in sub_ids.iter() {
            if let Some(sub) = env.storage().persistent().get::<DataKey, Subscription>(&DataKey::Subscription(id)) {
                user_subs.push_back(sub);
            }
        }
        user_subs
    }
}

#[cfg(test)]
mod test;
