#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    MerchantBalance(Address),
    TotalTreasuryBalance,
    ProtocolFeeBalance,
}

const PROTOCOL_FEE_BPS: i128 = 150; // 1.5% protocol fee (150 basis points)
const BPS_DENOMINATOR: i128 = 10000;

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    /// Initialize the treasury contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalTreasuryBalance, &0i128);
        env.storage().instance().set(&DataKey::ProtocolFeeBalance, &0i128);
    }

    /// Receive subscription payment from subscriber, record merchant balance after protocol fee split
    pub fn receive_payment(env: Env, merchant: Address, subscriber: Address, amount: i128) {
        subscriber.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }

        // Calculate protocol fee (1.5%) and net amount for merchant
        let protocol_fee = (amount * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        let merchant_amount = amount - protocol_fee;

        // Update merchant balance
        let current_merchant_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::MerchantBalance(merchant.clone()))
            .unwrap_or(0);
        
        env.storage().persistent().set(
            &DataKey::MerchantBalance(merchant.clone()),
            &(current_merchant_balance + merchant_amount),
        );

        // Update protocol fee balance
        let current_fee_balance: i128 = env
            .storage()
            .instance()
            .get(&DataKey::ProtocolFeeBalance)
            .unwrap_or(0);
        
        env.storage().instance().set(
            &DataKey::ProtocolFeeBalance,
            &(current_fee_balance + protocol_fee),
        );

        // Update total treasury balance
        let current_total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTreasuryBalance)
            .unwrap_or(0);
        
        env.storage().instance().set(
            &DataKey::TotalTreasuryBalance,
            &(current_total + amount),
        );

        // Emit payment event
        env.events().publish(
            (symbol_short!("pay_rcvd"), merchant, subscriber),
            amount,
        );
    }

    /// Allow merchant to withdraw their accumulated revenue
    pub fn withdraw(env: Env, merchant: Address, amount: i128) -> i128 {
        merchant.require_auth();

        if amount <= 0 {
            panic!("Withdraw amount must be greater than zero");
        }

        let current_merchant_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::MerchantBalance(merchant.clone()))
            .unwrap_or(0);

        if current_merchant_balance < amount {
            panic!("Insufficient merchant treasury balance");
        }

        let new_merchant_balance = current_merchant_balance - amount;
        env.storage().persistent().set(
            &DataKey::MerchantBalance(merchant.clone()),
            &new_merchant_balance,
        );

        // Update total treasury balance
        let current_total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalTreasuryBalance)
            .unwrap_or(0);
        
        env.storage().instance().set(
            &DataKey::TotalTreasuryBalance,
            &(current_total - amount),
        );

        // Emit withdrawal event
        env.events().publish(
            (symbol_short!("withdraw"), merchant),
            amount,
        );

        new_merchant_balance
    }

    /// Get total treasury balance across all merchants & protocol fees
    pub fn get_balance(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalTreasuryBalance)
            .unwrap_or(0)
    }

    /// Get treasury balance for a specific merchant
    pub fn get_merchant_balance(env: Env, merchant: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::MerchantBalance(merchant))
            .unwrap_or(0)
    }

    /// Get accumulated protocol fee balance
    pub fn get_protocol_fee_balance(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::ProtocolFeeBalance)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
