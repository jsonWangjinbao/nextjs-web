"use client";

import { useBalance, useConnection } from "wagmi";
import { formatUnits } from "viem";

export function Balance() {
  const { address } = useConnection();
  const { data, isError, isLoading } = useBalance({
    address,
  });

  if (isLoading) return <div>Fetching balance...</div>;
  if (isError) return <div>Error fetching balance</div>;

  return (
    <div>
      Native Balance:{" "}
      <span className="font-mono font-bold">
        {data?.value && data.decimals
          ? formatUnits(data.value, data.decimals)
          : "0"}{" "}
        {data?.symbol}
      </span>
    </div>
  );
}
