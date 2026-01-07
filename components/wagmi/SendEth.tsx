"use client";

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { FormEvent } from "react";

export function SendEth() {
  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
  } = useSendTransaction();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const to = formData.get("address") as `0x${string}`;
    const value = formData.get("value") as string;

    sendTransaction({ to, value: parseEther(value) });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 max-w-sm">
      <input
        name="address"
        placeholder="Recipient Address (0x...)"
        required
        className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <input
        name="value"
        placeholder="Amount (ETH)"
        required
        className="p-2 border border-gray-700 rounded bg-gray-900 text-white placeholder-gray-400"
      />
      <button
        disabled={isPending}
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isPending ? "Confirming..." : "Send"}
      </button>
      {hash && (
        <div className="text-xs break-all">Transaction Hash: {hash}</div>
      )}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && (
        <div className="text-green-600">Transaction Confirmed!</div>
      )}
      {error && (
        <div className="text-red-500">
          Error:{" "}
          {(error as { shortMessage?: string; message: string }).shortMessage ||
            error.message}
        </div>
      )}
    </form>
  );
}
