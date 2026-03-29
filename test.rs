#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Ledger, Env, String};

#[test]
fn test_vesting_lifecycle() {
    // 1. Setup the Soroban Environment
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenVestingContract);
    let client = TokenVestingContractClient::new(&env, &contract_id);

    // 2. Define Test Data
    let beneficiary = String::from_str(&env, "G_BENEFICIARY_ADDR");
    let amount: u64 = 5000;
    let unlock_time: u64 = 1000; // Unlock at timestamp 1000

    // Set initial ledger time to 0
    env.ledger().set_timestamp(0);

    // 3. Create a Vesting Schedule
    let schedule_id = client.create_schedule(&beneficiary, &amount, &unlock_time);
    assert_eq!(schedule_id, 1);

    // Verify schedule details
    let schedule = client.view_schedule(&schedule_id);
    assert_eq!(schedule.amount, 5000);
    assert_eq!(schedule.is_released, false);

    // 4. Try to release tokens BEFORE unlock_time (Should Panic)
    // We use 'env.ledger().set_timestamp' to simulate time passing
    env.ledger().set_timestamp(500); 
    
    let result = std::panic::catch_unwind(|| {
        client.release_tokens(&schedule_id);
    });
    assert!(result.is_err(), "Should not release before unlock_time");

    // 5. Release tokens AFTER unlock_time (Should Succeed)
    env.ledger().set_timestamp(1500); // 1500 > 1000
    client.release_tokens(&schedule_id);

    // Verify final state
    let updated_schedule = client.view_schedule(&schedule_id);
    assert_eq!(updated_schedule.is_released, true);
}

#[test]
#[should_panic(expected = "Error: Schedule ID not found")]
fn test_invalid_schedule_id() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenVestingContract);
    let client = TokenVestingContractClient::new(&env, &contract_id);

    // Try to view an ID that was never created
    client.view_schedule(&99);
}