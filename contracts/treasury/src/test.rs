#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_balances() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.get_balance(), 0);
    assert_eq!(client.get_protocol_fee_balance(), 0);
}

#[test]
fn test_receive_payment_and_fee_split() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let subscriber = Address::generate(&env);

    client.initialize(&admin);

    // Receive payment of 1,000 XLM (1,000,000,000 stroops or 1000 units)
    let payment_amount: i128 = 1000;
    client.receive_payment(&merchant, &subscriber, &payment_amount);

    // 1.5% of 1000 = 15 protocol fee, 985 net to merchant
    assert_eq!(client.get_merchant_balance(&merchant), 985);
    assert_eq!(client.get_protocol_fee_balance(), 15);
    assert_eq!(client.get_balance(), 1000);
}

#[test]
fn test_merchant_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TreasuryContract);
    let client = TreasuryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let merchant = Address::generate(&env);
    let subscriber = Address::generate(&env);

    client.initialize(&admin);

    // Payment of 2,000 XLM
    client.receive_payment(&merchant, &subscriber, &2000);
    // Net merchant balance = 2000 - 30 (1.5%) = 1970

    assert_eq!(client.get_merchant_balance(&merchant), 1970);

    // Withdraw 1000 XLM
    let remaining = client.withdraw(&merchant, &1000);
    assert_eq!(remaining, 970);
    assert_eq!(client.get_merchant_balance(&merchant), 970);
    assert_eq!(client.get_balance(), 1000); // 2000 total - 1000 withdrawn
}
