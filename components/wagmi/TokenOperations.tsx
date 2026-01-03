"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { parseUnits, formatUnits, parseAbi } from "viem";
import { useState, FormEvent } from "react";
import { useConnection } from "wagmi";

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

export function TokenOperations() {
  const { address } = useConnection();
  const [logs, setLogs] = useState<any[]>([]);

  // 1. 获取余额
  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const { data: decimals } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  const { data: symbol } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  // 2. 转账
  const {
    data: hash,
    isPending,
    mutateAsync: writeContract,
    error,
  } = useWriteContract();

  async function handleTransfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const to = formData.get("to") as `0x${string}`;
    const amount = formData.get("amount") as string;

    try {
      await writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, parseUnits(amount, decimals || 18)],
      });
    } catch (err) {
      console.error("Transfer failed", err);
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // 3. 事件监听
  useWatchContractEvent({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    eventName: "Transfer",
    poll: true,
    pollingInterval: 2_000,
    onLogs(newLogs) {
      console.log("newLogs", newLogs);
      setLogs((prev) => [...newLogs, ...prev]);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Token Balance</h3>
        <p>
          {balance !== undefined && decimals !== undefined
            ? `${formatUnits(balance, decimals)} ${symbol}`
            : "Loading..."}
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Transfer Token</h3>
        <form
          onSubmit={handleTransfer}
          className="flex flex-col gap-2 max-w-sm"
        >
          <input
            name="to"
            placeholder="Recipient Address (0x...)"
            required
            className="p-2 border rounded text-black bg-white"
          />
          <input
            name="amount"
            placeholder="Amount"
            required
            className="p-2 border rounded text-black bg-white"
          />
          <button
            disabled={isPending}
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isPending ? "Confirming..." : "Transfer"}
          </button>
          {hash && <div className="text-xs break-all">Tx Hash: {hash}</div>}
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && (
            <div className="text-green-600">Transfer Successful!</div>
          )}
          {error && (
            <div className="text-red-500">
              Error:{" "}
              {(error as { shortMessage?: string; message: string })
                .shortMessage || error.message}
            </div>
          )}
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Recent Events (Live)</h3>
        <div className="max-h-40 overflow-y-auto border p-2 rounded bg-gray-50 dark:bg-gray-900 text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-500">Listening for Transfer events...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1 border-b pb-1 last:border-0">
                <span className="text-blue-500">From:</span>{" "}
                {log.args.from?.slice(0, 6)}...{log.args.from?.slice(-4)} <br />
                <span className="text-green-500">To:</span>{" "}
                {log.args.to?.slice(0, 6)}...{log.args.to?.slice(-4)} <br />
                <span className="text-orange-500">Value:</span>{" "}
                {log.args.value?.toString()}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
