import { 
    isConnected, 
    getPublicKey, 
    signTransaction 
} from "@stellar/freighter-api";
import { 
    TransactionBuilder, 
    Networks, 
    Contract, 
    rpc, 
    xdr 
} from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);
const CONTRACT_ID = "CC..."; // Replace with your actual Contract ID
const NETWORK_PASSPHRASE = Networks.TESTNET;

/**
 * Connects to Freighter and returns the user's Public Key
 */
async function connectWallet() {
    if (await isConnected()) {
        const publicKey = await getPublicKey();
        console.log("Connected to Freighter:", publicKey);
        return publicKey;
    } else {
        alert("Please install the Freighter extension!");
        return null;
    }
}

/**
 * Invokes 'release_tokens' using the user's wallet
 * @param {number} scheduleId - The ID of the vesting schedule to claim
 */
async function releaseTokensWithFreighter(scheduleId) {
    const userPublicKey = await connectWallet();
    if (!userPublicKey) return;

    try {
        const contract = new Contract(CONTRACT_ID);
        const account = await server.getAccount(userPublicKey);

        // 1. Build the transaction
        const tx = new TransactionBuilder(account, {
            fee: "1000", // Standard fee
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            contract.call(
                "release_tokens",
                xdr.ScVal.scvU64(xdr.Uint64.fromString(scheduleId.toString()))
            )
        )
        .setTimeout(30)
        .build();

        // 2. Prepare the transaction for Soroban (Footprint/Resources)
        const preparedTx = await server.prepareTransaction(tx);

        // 3. Request user signature via Freighter
        const xdrString = preparedTx.toXDR();
        const signedXdr = await signTransaction(xdrString, {
            network: "TESTNET",
            accountToSign: userPublicKey
        });

        // 4. Submit to the network
        console.log("Submitting transaction...");
        const result = await server.sendTransaction(signedXdr);
        
        if (result.status !== "PENDING") {
            throw new Error("Transaction submission failed");
        }

        // 5. Poll for status
        const finalResult = await pollTransactionStatus(result.hash);
        console.log("Tokens Released Successfully!", finalResult);
        alert("Success! Your tokens have been released.");

    } catch (error) {
        console.error("Vesting Release Error:", error);
        alert("Failed to release tokens: " + error.message);
    }
}

/**
 * Helper to poll for the transaction result
 */
async function pollTransactionStatus(hash) {
    let response = await server.getTransaction(hash);
    while (response.status === "NOT_FOUND" || response.status === "SUCCESS" === false) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        response = await server.getTransaction(hash);
        if (response.status === "SUCCESS") return response;
        if (response.status === "FAILED") throw new Error("On-chain execution failed");
    }
    return response;
}

export { connectWallet, releaseTokensWithFreighter };