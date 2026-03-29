import { Contract, Horizon, rpc, Keypair, scValToNative, xdr } from '@stellar/stellar-sdk';

/**
 * Configuration for the Soroban RPC and Contract
 */
const RPC_URL = 'https://soroban-testnet.stellar.org'; // Testnet URL
const server = new rpc.Server(RPC_URL);
const CONTRACT_ID = 'CC...'; // Replace with your deployed Contract ID
const networkPassphrase = 'Test SDF Network ; September 2015';

/**
 * Function to fetch and format a Vesting Schedule
 * @param {number} scheduleId - The unique ID of the vesting schedule
 */
async function fetchVestingSchedule(scheduleId) {
    try {
        console.log(`--- Fetching Schedule ID: ${scheduleId} ---`);

        const contract = new Contract(CONTRACT_ID);

        // 1. Prepare the function call (view_schedule)
        // We convert the JS number to a Soroban u64 ScVal
        const params = [xdr.ScVal.scvU64(xdr.Uint64.fromString(scheduleId.toString()))];
        
        // 2. Simulate the transaction to get the result without submitting a fee-paying Tx
        const simulation = await server.simulateTransaction(
            contract.call('view_schedule', ...params)
        );

        if (rpc.Api.isSimulationSuccess(simulation)) {
            // 3. Decode the ScVal result to a native JS object
            const result = scValToNative(simulation.result.retval);
            
            // Format the Unix timestamp to a readable date
            const unlockDate = new Date(Number(result.unlock_time) * 1000).toLocaleString();

            const feedback = {
                id: scheduleId,
                beneficiary: result.beneficiary.toString(),
                amount: Number(result.amount),
                unlockAt: unlockDate,
                isReleased: result.is_released,
                isMatured: Date.now() / 1000 > Number(result.unlock_time)
            };

            console.table(feedback);
            return feedback;
        } else {
            console.error("Simulation failed. Does the ID exist?");
        }
    } catch (error) {
        console.error("Error communicating with Soroban RPC:", error);
    }
}

/**
 * Function to fetch the total number of schedules
 */
async function fetchTotalSchedules() {
    const contract = new Contract(CONTRACT_ID);
    const simulation = await server.simulateTransaction(contract.call('get_total_requests')); // Assuming count getter exists
    
    if (rpc.Api.isSimulationSuccess(simulation)) {
        return scValToNative(simulation.result.retval);
    }
    return 0;
}

// --- Execution Example ---
// Replace '1' with a valid ID you created in your contract
fetchVestingSchedule(1);