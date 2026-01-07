"use client";

import { useState } from "react";
import {
  BrowserProvider,
  Contract,
  formatEther,
  parseEther,
  formatUnits,
  parseUnits,
} from "ethers";

const ERC20_ABI = [
  "constructor(string _name, string _symbol, uint256 _initialSupply)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Burn(address indexed from, uint256 amount)",
  "event Mint(address indexed to, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Pause()",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Unpause()",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address _spender, uint256 _value) returns (bool success)",
  "function balanceOf(address) view returns (uint256)",
  "function burn(uint256 _amount) returns (bool success)",
  "function decimals() view returns (uint8)",
  "function decreaseAllowance(address _spender, uint256 _subtractedValue) returns (bool success)",
  "function increaseAllowance(address _spender, uint256 _addedValue) returns (bool success)",
  "function mint(address _to, uint256 _amount) returns (bool success)",
  "function name() view returns (string)",
  "function owner() view returns (address)",
  "function pause()",
  "function paused() view returns (bool)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address _to, uint256 _value) returns (bool success)",
  "function transferFrom(address _from, address _to, uint256 _value) returns (bool success)",
  "function transferOwnership(address newOwner)",
  "function unpause()",
];

const TOKEN_ADDRESS = "0xdfeF385cEA1067d81AafCa3603AF3b3AAdA633aB";

export function EthersDemo() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");

  // 代币状态
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);

  // 连接钱包
  async function connect() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const p = new BrowserProvider((window as any).ethereum);

      const network = await p.getNetwork();
      if (network.chainId !== BigInt(11155111)) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
          // 切换后重新初始化 provider 以确保正确
          const newProvider = new BrowserProvider((window as any).ethereum);
          const accounts = await newProvider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);
          setProvider(newProvider);
          updateBalance(newProvider, accounts[0]);
          return;
        } catch {
          alert("Please switch your wallet to Sepolia network manually.");
          return;
        }
      }

      const accounts = await p.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(p);
      updateBalance(p, accounts[0]);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateBalance(p: BrowserProvider, addr: string) {
    const bal = await p.getBalance(addr);
    setBalance(formatEther(bal));

    // 代币余额
    const contract = new Contract(TOKEN_ADDRESS, ERC20_ABI, p);
    const tBal = await contract.balanceOf(addr);
    const decimals = await contract.decimals();
    const sym = await contract.symbol();
    setTokenBalance(formatUnits(tBal, decimals));
    setTokenSymbol(sym);

    // 监听事件 (设置监听器)
    // 如果重新连接，先移除旧的监听器以避免重复?
    // 为简单起见，我们直接添加监听器。通常在 useEffect 中清理更好。
    contract.removeAllListeners("Transfer");
    contract.on("Transfer", (from, to, value) => {
      setLogs((prev) => [
        ...prev,
        { from, to, value: formatUnits(value, decimals) },
      ]); // 假设显示时使用相同的小数位数
    });
  }

  // 发送 ETH
  async function sendEth(e: any) {
    e.preventDefault();
    if (!provider || !account) return;

    const formData = new FormData(e.currentTarget);
    const to = formData.get("address") as string;
    const amount = formData.get("value") as string;

    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });
      alert(`Transaction Sent: ${tx.hash}`);
      await tx.wait();
      alert("Transaction Confirmed!");
      updateBalance(provider, account);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // 转移代币
  async function transferToken(e: any) {
    e.preventDefault();
    if (!provider || !account) return;

    const formData = new FormData(e.currentTarget);
    const to = formData.get("to") as string;
    const amount = formData.get("amount") as string;

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const tx = await contract.transfer(to, parseUnits(amount, decimals));
      alert(`Token Transfer Sent: ${tx.hash}`);
      await tx.wait();
      alert("Token Transfer Confirmed!");
      updateBalance(provider, account);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Connect */}
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">1. Connect Wallet</h2>
        {!account ? (
          <button
            onClick={connect}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Address: {account}</p>
            <p>Native Balance: {balance} ETH</p>
          </div>
        )}
      </div>

      {/* 2. Send ETH */}
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">2. Send ETH</h2>
        <form onSubmit={sendEth} className="flex flex-col gap-2 max-w-sm">
          <input
            name="address"
            placeholder="Recipient"
            className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
            required
          />
          <input
            name="value"
            placeholder="Amount (ETH)"
            className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Send
          </button>
        </form>
      </div>

      {/* 4 & 5. Token Ops */}
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">
          3. ERC-20 Operations ({tokenSymbol})
        </h2>
        <p className="mb-4">
          Balance: {tokenBalance} {tokenSymbol}
        </p>

        <form
          onSubmit={transferToken}
          className="flex flex-col gap-2 max-w-sm mb-4"
        >
          <h3 className="font-bold">Transfer</h3>
          <input
            name="to"
            placeholder="Recipient"
            className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
            required
          />
          <input
            name="amount"
            placeholder="Amount"
            className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Transfer Token
          </button>
        </form>

        <div>
          <h3 className="font-bold">Events</h3>
          <div className="max-h-40 overflow-y-auto bg-black text-white p-2 font-mono text-xs rounded">
            {logs.length === 0 ? (
              <p className="text-gray-500">Listening for Transfer events...</p>
            ) : (
              logs.map((l, i) => (
                <div
                  key={i}
                  className="border-b last:border-0 border-gray-700 pb-1 mb-1"
                >
                  Transfer {l.value} to {l.to.slice(0, 6)}...
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
