#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Env, Symbol, String, symbol_short, log};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VestingSchedule {
    pub beneficiary: String,
    pub amount: u64,
    pub unlock_time: u64, // Unix timestamp
    pub is_released: bool,
}

#[contracttype]
pub enum DataKey {
    Schedule(u64), // Map ID to Schedule
    TotalVested,
}

const TOTAL_VESTED: Symbol = symbol_short!("T_VEST");

#[contract]
pub struct TokenVestingContract;

#[contractimpl]
impl TokenVestingContract {
    // 1. Create a vesting schedule (Admin function)
    pub fn create_schedule(env: Env, beneficiary: String, amount: u64, unlock_time: u64) -> u64 {
        let mut total: u64 = env.storage().instance().get(&TOTAL_VESTED).unwrap_or(0);
        total += 1;

        let schedule = VestingSchedule {
            beneficiary,
            amount,
            unlock_time,
            is_released: false,
        };

        env.storage().instance().set(&DataKey::Schedule(total), &schedule);
        env.storage().instance().set(&TOTAL_VESTED, &total);
        
        log!(&env, "Vesting Schedule created. ID: {}, Unlock at: {}", total, unlock_time);
        total
    }

    // 2. Release tokens (Beneficiary function)
    pub fn release_tokens(env: Env, schedule_id: u64) {
        let key = DataKey::Schedule(schedule_id);
        let mut schedule: VestingSchedule = env.storage().instance().get(&key)
            .expect("Schedule not found");

        let current_time = env.ledger().timestamp();

        // Logic check: Must be past unlock time and not already released
        if current_time >= schedule.unlock_time && !schedule.is_released {
            schedule.is_released = true;
            env.storage().instance().set(&key, &schedule);
            log!(&env, "Tokens released for ID: {}", schedule_id);
        } else {
            panic!("Tokens are still locked or already released");
        }
    }

    // 3. View schedule details
    pub fn view_schedule(env: Env, schedule_id: u64) -> VestingSchedule {
        let key = DataKey::Schedule(schedule_id);
        env.storage().instance().get(&key).expect("Schedule not found")
    }
}