#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// Import Treasury contract for mock registration
mod treasury_mock {
    use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

    #[contract]
    pub struct TreasuryMockContract;

    #[contractimpl]
    impl TreasuryMockContract {
        pub fn receive_payment(env: Env, merchant: Address, subscriber: Address, amount: i128) {
            env.events().publish((symbol_short!("pay_rcvd"), merchant, subscriber), amount);
        }
    }
}

#[test]
fn test_create_and_get_plan() {
    let env = Env::default();
    env.mock_all_auths();

    let sub_contract_id = env.register_contract(None, SubscriptionContract);
    let client = SubscriptionContractClient::new(&env, &sub_contract_id);

    let admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let treasury = Address::generate(&env);

    client.initialize(&admin, &treasury);

    let title = String::from_str(&env, "Pro SaaS Monthly");
    let description = String::from_str(&env, "Unlimited access to SubscriptX suite");
    let price_xlm: i128 = 50;
    let interval_secs: u64 = 2592000; // 30 days
    let max_subscribers: u32 = 100;

    let plan_id = client.create_plan(
        &merchant,
        &title,
        &description,
        &price_xlm,
        &interval_secs,
        &max_subscribers,
    );

    assert_eq!(plan_id, 1);

    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.id, 1);
    assert_eq!(plan.merchant, merchant);
    assert_eq!(plan.price_xlm, 50);
    assert_eq!(plan.subscribers_count, 0);
    assert!(plan.is_active);

    let all_plans = client.get_all_plans();
    assert_eq!(all_plans.len(), 1);
}

#[test]
fn test_subscribe_with_treasury_intercontract_call() {
    let env = Env::default();
    env.mock_all_auths();

    let treasury_id = env.register_contract(None, treasury_mock::TreasuryMockContract);
    let sub_contract_id = env.register_contract(None, SubscriptionContract);
    let client = SubscriptionContractClient::new(&env, &sub_contract_id);

    let admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let subscriber = Address::generate(&env);

    client.initialize(&admin, &treasury_id);

    let plan_id = client.create_plan(
        &merchant,
        &String::from_str(&env, "Enterprise Plan"),
        &String::from_str(&env, "Full platform access"),
        &150i128,
        &2592000u64,
        &50u32,
    );

    let sub_id = client.subscribe(&plan_id, &subscriber);
    assert_eq!(sub_id, 1);

    let plan = client.get_plan(&plan_id);
    assert_eq!(plan.subscribers_count, 1);

    let user_subs = client.get_user_subscriptions(&subscriber);
    assert_eq!(user_subs.len(), 1);
    assert_eq!(user_subs.get(0).unwrap().plan_id, plan_id);
    assert!(user_subs.get(0).unwrap().is_active);
}

#[test]
fn test_cancel_subscription() {
    let env = Env::default();
    env.mock_all_auths();

    let treasury_id = env.register_contract(None, treasury_mock::TreasuryMockContract);
    let sub_contract_id = env.register_contract(None, SubscriptionContract);
    let client = SubscriptionContractClient::new(&env, &sub_contract_id);

    let admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let subscriber = Address::generate(&env);

    client.initialize(&admin, &treasury_id);

    let plan_id = client.create_plan(
        &merchant,
        &String::from_str(&env, "Starter"),
        &String::from_str(&env, "Basic tier"),
        &10i128,
        &86400u64,
        &10u32,
    );

    let sub_id = client.subscribe(&plan_id, &subscriber);
    assert_eq!(client.get_plan(&plan_id).subscribers_count, 1);

    client.cancel_subscription(&sub_id, &subscriber);

    assert_eq!(client.get_plan(&plan_id).subscribers_count, 0);

    let user_subs = client.get_user_subscriptions(&subscriber);
    assert!(!user_subs.get(0).unwrap().is_active);
}
