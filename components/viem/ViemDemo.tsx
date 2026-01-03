"use client";

import { useState } from "react";
import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
  formatEther,
  parseEther,
  parseUnits,
  formatUnits,
  parseAbi,
} from "viem";
import { sepolia } from "viem/chains";

const ERC20_ABI = parseAbi([
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
]);

const TOKEN_ADDRESS = "0xdfeF385cEA1067d81AafCa3603AF3b3AAdA633aB";

export function ViemDemo() {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [walletClient, setWalletClient] = useState<any>(null);
  const [publicClient, setPublicClient] = useState<any>(null);

  // 代币状态
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [logs, setLogs] = useState<any[]>([]);

  // 连接钱包
  async function connect() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const wallet = createWalletClient({
      chain: sepolia,
      transport: custom((window as any).ethereum),
    });

    const publicC = createPublicClient({
      chain: sepolia, // 假设使用 Sepolia 测试网
      transport: http(),
    });

    try {
      const [address] = await wallet.requestAddresses();
      setAccount(address);
      setWalletClient(wallet);
      setPublicClient(publicC);

      updateBalance(publicC, address);
      setupEventListener(publicC);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateBalance(pc: any, addr: `0x${string}`) {
    const bal = await pc.getBalance({ address: addr });
    setBalance(formatEther(bal));

    // 代币
    try {
      const tBal = await pc.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [addr],
      });
      const decimals = await pc.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "decimals",
      });
      const sym = await pc.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "symbol",
      });

      setTokenBalance(formatUnits(tBal, decimals));
      setTokenSymbol(sym);
      setTokenDecimals(decimals);
    } catch (e) {
      console.error("Error fetching token info", e);
    }
  }

  function setupEventListener(pc: any) {
    pc.watchContractEvent({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      eventName: "Transfer",
      onLogs: (logs: any[]) => {
        setLogs((prev) => [
          ...prev,
          ...logs.map((l) => ({
            from: l.args.from,
            to: l.args.to,
            value: l.args.value,
          })),
        ]);
      },
    });
  }

  async function sendEth(e: any) {
    e.preventDefault();
    if (!walletClient || !account) return;

    const formData = new FormData(e.currentTarget);
    const to = formData.get("address") as `0x${string}`;
    const value = formData.get("value") as string;

    try {
      const hash = await walletClient.sendTransaction({
        account,
        to,
        value: parseEther(value),
      });
      alert(`Transaction Sent: ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });
      alert("Confirmed!");
      updateBalance(publicClient, account);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function transferToken(e: any) {
    e.preventDefault();
    if (!walletClient || !account) return;

    const formData = new FormData(e.currentTarget);
    const to = formData.get("to") as `0x${string}`;
    const amount = formData.get("amount") as string;

    try {
      const { request } = await publicClient.simulateContract({
        account,
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, parseUnits(amount, tokenDecimals)],
      });
      const hash = await walletClient.writeContract(request);
      alert(`Transfer Sent: ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });
      alert("Transfer Confirmed!");
      updateBalance(publicClient, account);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
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

      <div className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">2. Send ETH</h2>
        <form onSubmit={sendEth} className="flex flex-col gap-2 max-w-sm">
          <input
            name="address"
            placeholder="Recipient"
            className="p-2 bg-white text-black rounded"
            required
          />
          <input
            name="value"
            placeholder="Amount (ETH)"
            className="p-2 bg-white text-black rounded"
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

      <div className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
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
            className="p-2 bg-white text-black rounded"
            required
          />
          <input
            name="amount"
            placeholder="Amount"
            className="p-2 bg-white text-black rounded"
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
                  Transfer {formatUnits(l.value, tokenDecimals)} to{" "}
                  {l.to.slice(0, 6)}...
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
