import { 
    TransactionBuilder, 
    Networks, 
    Contract, 
    rpc, 
    xdr, 
    nativeToScVal 
} from "@stellar/stellar-sdk";
import { getPublicKey, signTransaction } from "@stellar/freighter-api";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);
const CONTRACT_ID = "CC..."; // Replace with your actual Contract ID
const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * Creates a new Vesting Schedule on the blockchain
 * @param {string} beneficiary - The public key of the recipient
 * @param {number} amount - Amount of tokens to vest
 * @param {number} unlockDate - Unix timestamp for the cliff
 */
export async function createVestingSchedule(beneficiary, amount, unlockDate) {
    try {
        const adminPublicKey = await getPublicKey();
        if (!adminPublicKey) throw new Error("Wallet not connected");

        console.log("Preparing to create schedule...");

        const contract = new Contract(CONTRACT_ID);
        const account = await server.getAccount(adminPublicKey);

        // 1. Build the transaction calling 'create_schedule'
        // Parameters: (beneficiary: String, amount: u64, unlock_time: u64)
        const tx = new TransactionBuilder(account, {
            fee: "1000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            contract.call(
                "create_schedule",
                nativeToScVal(beneficiary, { type: "string" }),
                nativeToScVal(amount, { type: "u64" }),
                nativeToScVal(unlockDate, { type: "u64" })
            )
        )
        .setTimeout(30)
        .build();

        // 2. Simulate & Prepare (Crucial for Soroban resource fees)
        const preparedTx = await server.prepareTransaction(tx);

        // 3. Sign with Freighter
        const signedXdr = await signTransaction(preparedTx.toXDR(), {
            network: "TESTNET",
        });

        // 4. Submit and Wait
        const response = await server.sendTransaction(signedXdr);
        console.log("Transaction submitted. Hash:", response.hash);

        // Optional: Implementation of a loading spinner logic here
        return response.hash;

    } catch (error) {
        console.error("Failed to send vesting data:", error);
        throw error;
    }
}