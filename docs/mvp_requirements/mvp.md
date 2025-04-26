To streamline the project into a 5-day MVP demo while retaining core value propositions, here's a prioritized and minimized plan:

---

### **MVP Core Scope**  
**Objective**: Demonstrate **dynamic pricing tied to Bitcoin hash rate** and **bond pool payout verification** with minimal but functional components.

---

### **Day 1-2: Simplified Contract System**  
1. **Hybrid Insurance/Bond Contract** (Merge NFT & AMM logic)  
   - Replace `sBTC` with **Wrapped BTC (WBTC)** for faster cross-chain integration.  
   - **Critical Functions**:  
     - `purchaseInsurance(amount, duration)`: Mints NFT with hash-rate-triggered payout terms.  
     - `stakeInBondPool(amount)`: Simple staking with fixed APY (simulated, e.g., 5%).  
   - **Oracles**:  
     - Use **Chainlink Data Feed** (BTC/USD) + **Mock Hash Rate** (local JSON with historical data).  

2. **Dynamic Pricing Model**  
   - Simplify to **linear risk premium**:  
     ```
     Premium = BaseRate × (1 + HashRateVolatility / 100)  
     ```  
   - Hardcode `BaseRate` (e.g., 0.1% per day) and pull volatility from mock data.  

---

### **Day 3-4: Frontend & Integration**  
1. **React Frontend** (Single-page, 3 core views):  
   - **Dashboard**:  
     - Real-time hash rate chart (static mock data from `data.json`).  
     - Insurance/Bond Pool TVL (hardcoded initial value).  
   - **Insurance Purchase**:  
     - Input amount/duration → Display premium via simplified formula.  
     - MetaMask integration for WBTC approval/NFT minting.  
   - **Bond Pool**:  
     - Stake/Unstake buttons with simulated APY.  

2. **Backend Simulator** (Node.js/Express):  
   - Emulate **minute-level checks** for hash rate triggers:  
     - If mock hash rate drops >10% in 10 mins, auto-pay NFT holders from bond pool.  

---

### **Day 5: Testing & Demo Script**  
1. **Test Cases**:  
   - Scenario 1: Hash rate stability → No payout, bond pool grows.  
   - Scenario 2: Simulated 15% hash rate drop → Payout to NFT holders.  
2. **Demo Flow**:  
   - User buys insurance (NFT) → Stake in bond pool → Trigger mock hash crash → Verify payout.  

---

### **Cut Features**  
| Original Component      | MVP Alternative               |  
|-------------------------|-------------------------------|  
| Cross-chain monitoring  | WBTC instead of sBTC          |  
| TWAP oracles            | Static Chainlink BTC price    |  
| Risk control panel      | Hardcoded 10% threshold        |  
| Full AMM                | Fixed APY staking             |  

---
