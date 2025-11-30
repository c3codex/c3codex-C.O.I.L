document.getElementById("year").textContent = new Date().getFullYear();

const connectBtn = document.getElementById("connectWallet");
const statusEl = document.getElementById("walletStatus");

connectBtn?.addEventListener("click", async () => {
  if (!window.ethereum) {
    statusEl.textContent = "No wallet detected.";
    return;
  }

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    const address = accounts[0];
    statusEl.textContent = "Connected: " + address.slice(0, 6) + "..." + address.slice(-4);
  } catch (err) {
    statusEl.textContent = "Wallet connection rejected.";
  }
});
