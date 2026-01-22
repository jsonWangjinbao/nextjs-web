import {
  useBalance,
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { TOKEN_ADDRESS, Pid } from "@/utils/constant";
import { stakeAbi } from "@/assets/abis/stake";
import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";

export type UserStakeData = {
  staked: string;
  withdrawPending: string;
  withdrawable: string;
};

export default function useStakeContract() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState<number | undefined>();
  const [unstakeAmount, setUnstakeAmount] = useState<number | undefined>();
  const { data, isError, isLoading } = useBalance({
    address,
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
      refetchIntervalInBackground: false,
    },
  });

  const availableETH = useMemo(() => {
    return data?.value && data?.decimals
      ? Number(formatUnits(data.value, data.decimals)).toFixed(4)
      : "0";
  }, [data]);

  // 获取 pool 信息
  const { data: poolInfo } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: "pool",
    args: [BigInt(Pid)],
    query: {
      enabled: !!address,
    },
  });

  // 获取 user 信息
  const { data: userData, refetch: refetchUserData } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: "user",
    args: [BigInt(Pid), address!],
    query: {
      enabled: !!address,
    },
  });

  // 获取质押金额
  const { data: _stakingBalance = BigInt(0), refetch: refetchStakingBalance } =
    useReadContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: stakeAbi,
      functionName: "stakingBalance",
      args: [BigInt(Pid), address!],
      query: {
        enabled: !!address,
      },
    });
  // 获取可以提取金额和质押金额
  const { data: withdrawAmountInfo, refetch: refetchWithdrawAmountInfo } =
    useReadContract({
      address: TOKEN_ADDRESS as `0x${string}`,
      abi: stakeAbi,
      functionName: "withdrawAmount",
      args: [BigInt(Pid), address!],
      query: {
        enabled: !!address,
      },
    });

  const [requestAmount, pendingWithdrawAmount] = withdrawAmountInfo || [];
  const ava = Number(formatUnits(BigInt(pendingWithdrawAmount! ?? 0), 18));
  console.log("🚀 ~ useStakeContract ~ ava:", ava);
  const total = useMemo(
    () => Number(formatUnits(BigInt(requestAmount! ?? 0), 18)),
    [requestAmount]
  );
  console.log("🚀 ~ useStakeContract ~ total:", total);
  const withdrawPending = useMemo(() => (total - ava).toFixed(4), [total, ava]);
  const withdrawable = useMemo(() => ava.toFixed(4), [ava]);
  const stakingBalance = useMemo(
    () => Number(formatUnits(_stakingBalance!, 18)).toFixed(4),
    [_stakingBalance]
  );
  const pendingReward = useMemo(
    () => Number(formatUnits(userData?.[2] || BigInt(0), 18)).toFixed(4),
    [userData]
  );
  const lastUpdate = Date.now();

  const {
    data: hash,
    isPending,
    writeContractAsync: writeContract,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const [operation, setOperation] = useState<
    "stake" | "unstake" | "withdraw" | "claim" | null
  >(null);

  useEffect(() => {
    if (!isPending && !isConfirming) {
      setOperation(null);
    }
  }, [isPending, isConfirming]);

  const handleStake = async () => {
    try {
      setOperation("stake");
      const result = await writeContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "depositETH",
        args: [],
        value: parseUnits(stakeAmount!.toString(), 18),
      });
      console.log(result, "result");
    } catch (error) {
      console.log(error, "error");
      setOperation(null);
    }
  };

  const handleUnstake = async () => {
    try {
      setOperation("unstake");
      const result = await writeContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "unstake",
        args: [BigInt(Pid), parseUnits(unstakeAmount!.toString(), 18)],
      });
      console.log(result, "result");
    } catch (error) {
      console.log(error, "error");
      setOperation(null);
    }
  };

  const handleWithdraw = async () => {
    try {
      setOperation("withdraw");
      const result = await writeContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "withdraw",
        args: [BigInt(Pid)],
      });
      console.log(result, "result");
    } catch (error) {
      console.log(error, "error");
      setOperation(null);
    }
  };

  const handleClaim = async () => {
    try {
      setOperation("claim");
      const result = await writeContract({
        address: TOKEN_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "claim",
        args: [BigInt(Pid)],
      });
      console.log(result, "result");
    } catch (error) {
      console.log(error, "error");
      setOperation(null);
    }
  };

  // 事件监听
  useWatchContractEvent({
    address: TOKEN_ADDRESS,
    abi: stakeAbi,
    eventName: "Deposit",
    enabled: isConnected,
    // 关键：添加链ID
    chainId: 11155111, // Sepolia
    onLogs(newLogs) {
      console.log("🔥 [useWatchContractEvent] newLogs:", newLogs);
      toast.success("Stake successful");
      refetchStakingBalance();
      setStakeAmount(0);
    },
    onError(error) {
      console.error("❌ [useWatchContractEvent] error:", error);
    },
  });

  useWatchContractEvent({
    address: TOKEN_ADDRESS,
    abi: stakeAbi,
    eventName: "RequestUnstake",
    enabled: isConnected,
    // 关键：添加链ID
    chainId: 11155111, // Sepolia
    onLogs(newLogs) {
      console.log("🔥 [useWatchContractEvent] newLogs:", newLogs);
      toast.success("Unstake successful");
      refetchStakingBalance();
      refetchWithdrawAmountInfo();
      setUnstakeAmount(0);
    },
    onError(error) {
      console.error("❌ [useWatchContractEvent] error:", error);
    },
  });

  useWatchContractEvent({
    address: TOKEN_ADDRESS,
    abi: stakeAbi,
    eventName: "Withdraw",
    enabled: isConnected,
    // 关键：添加链ID
    chainId: 11155111, // Sepolia
    onLogs(newLogs) {
      console.log("🔥 [useWatchContractEvent] newLogs:", newLogs);
      toast.success("Withdraw successful");
      refetchStakingBalance();
      refetchWithdrawAmountInfo();
    },
    onError(error) {
      console.error("❌ [useWatchContractEvent] error:", error);
    },
  });

  useWatchContractEvent({
    address: TOKEN_ADDRESS,
    abi: stakeAbi,
    eventName: "Claim",
    enabled: isConnected,
    // 关键：添加链ID
    chainId: 11155111, // Sepolia
    onLogs(newLogs) {
      console.log("🔥 [useWatchContractEvent] newLogs:", newLogs);
      toast.success("Claim successful");
      refetchUserData();
      refetchStakingBalance();
    },
    onError(error) {
      console.error("❌ [useWatchContractEvent] error:", error);
    },
  });

  return {
    data,
    isError,
    isLoading,
    stakeAmount,
    setStakeAmount,
    availableETH,
    poolInfo,
    userData,
    stakingBalance,
    isPending,
    isConfirming,
    error,
    handleStake,
    withdrawPending,
    withdrawable,
    handleUnstake,
    handleWithdraw,
    unstakeAmount,
    setUnstakeAmount,
    isStakePending: (isPending || isConfirming) && operation === "stake",
    isUnstakePending: (isPending || isConfirming) && operation === "unstake",
    isWithdrawPending: (isPending || isConfirming) && operation === "withdraw",
    isClaimPending: (isPending || isConfirming) && operation === "claim",
    pendingReward,
    lastUpdate,
    handleClaim,
  };
}
