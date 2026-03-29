import { connectWallet } from "./freighter.js";

/**
 * Initializes the header logic
 */
export function initHeader() {
    const connectBtn = document.getElementById("connect-wallet-btn");
    const walletAddressDisplay = document.getElementById("wallet-address");

    if (!connectBtn) return;

    connectBtn.addEventListener("click", async () => {
        // 1. Trigger the Freighter handshake
        const publicKey = await connectWallet();

        if (publicKey) {
            // 2. Update UI to show connection success
            connectBtn.innerText = "Connected";
            connectBtn.classList.add("btn-success");
            
            // 3. Display truncated address (e.g., GABC...XYZ)
            const truncated = `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`;
            walletAddressDisplay.innerText = truncated;
            walletAddressDisplay.style.display = "inline-block";
            
            console.log("Header: Wallet successfully linked.");
        }
    });
}

/**
 * Example Template for your HTML:
 * * <header class="navbar">
 * <div class="logo">Token Vesting Tool</div>
 * <nav>
 * <a href="#dashboard">Dashboard</a>
 * <a href="#docs">Docs</a>
 * </nav>
 * <div class="wallet-section">
 * <span id="wallet-address" style="display:none; margin-right: 10px;"></span>
 * <button id="connect-wallet-btn" class="btn">Connect Wallet</button>
 * </div>
 * </header>
 */