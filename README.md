## Project Title
**Token Vesting Tool**

---

## Project Description
The **Token Vesting Tool** is a decentralized smart contract solution developed using the **Soroban-SDK** for the Stellar network. It serves as a secure, time-locked vault for digital assets. The contract allows an administrator to create specific "vesting schedules" where tokens are committed to a beneficiary but remain programmatically locked until a predetermined Unix timestamp (the "cliff") is reached. This ensures that token distributions are handled automatically and transparently without the need for manual intervention or third-party escrow.

---

## Project Vision
Our vision is to provide a standardized, trustless infrastructure for tokenomics management within the Stellar ecosystem. By moving vesting schedules on-chain, we aim to eliminate "rug-pull" concerns and align the long-term interests of project founders, investors, and community members. We strive to make professional-grade financial tooling accessible to any project launching on Soroban.

---

## Key Features
* **Time-Locked Security:** Utilizes the `env.ledger().timestamp()` to ensure that no tokens can be released before the exact second specified in the schedule.
* **Unique Schedule Tracking:** Each vesting agreement is assigned a unique `u64` ID, allowing for easy tracking of multiple beneficiaries within a single contract instance.
* **Automated Validation:** The contract includes built-in checks to prevent double-spending (releasing tokens twice) or accessing non-existent schedules.
* **Storage Efficiency:** Implements Soroban's `instance` storage with `extend_ttl` to ensure that vesting data remains persistent on the ledger at a low cost.
* **Event Logging:** Uses the `log!` macro to provide real-time feedback during schedule creation and token release for easier debugging and auditing.

---

## Future Scope
* **Linear Vesting Implementation:** Moving beyond a single "cliff" release to support gradual, block-by-block token unlocking (e.g., 25% every 6 months).
* **Stellar Asset Contract (SAC) Integration:** Direct integration with the `token::Client` to handle the actual transfer of XLM or custom SEP-41 tokens upon release.
* **Multi-Sig Governance:** Requiring approval from multiple administrative accounts before a new vesting schedule can be initialized.
* **Revocation Logic:** Adding the ability for a DAO or admin to cancel a vesting schedule if a contributor leaves a project, returning the remaining locked tokens to the treasury.
* **User Dashboard:** A frontend interface where beneficiaries can connect their wallets (like Freighter) to view their remaining lock time and claim their tokens.

---
## Contract Details:
Contract ID : CBSYFXIWQNUTIIRZJP4L4XE2NVKSTWYT3AAZK2KVYSLR6KFGSEIS4QNT
<img width="1900" height="912" alt="image" src="https://github.com/user-attachments/assets/947bd1f2-df3a-4344-a688-4f0717b6222b" />
