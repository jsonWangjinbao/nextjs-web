"use client";

import { NumberInput, Card, CardBody, Button } from "@heroui/react";
import useStakeContract from "@/hooks/useStakeContract";
import { FiArrowUp, FiClock } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Withdraw() {
  const {
    stakingBalance,
    withdrawable,
    withdrawPending,
    handleUnstake,
    handleWithdraw,
    unstakeAmount,
    setUnstakeAmount,
    isUnstakePending,
    isWithdrawPending,
  } = useStakeContract();

  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    // Safe to use during hydration - will be 0 on server, correct value on client
    if (typeof window === "undefined") return 0;

    const storedEndTime = localStorage.getItem("withdrawCooldownEndTime");
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      return remaining;
    }
    return 0;
  });

  const [cooldownStarted, setCooldownStarted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("withdrawCooldownStarted") === "true";
  });

  const COOLDOWN_DURATION = 20 * 60; // 20 minutes in seconds

  // Start countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      localStorage.removeItem("withdrawCooldownEndTime");
      return;
    }

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          localStorage.removeItem("withdrawCooldownEndTime");
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleWithdrawClick = async () => {
    // If cooldown hasn't started yet, start it
    if (!cooldownStarted) {
      const endTime = Date.now() + COOLDOWN_DURATION * 1000;
      window.localStorage.setItem(
        "withdrawCooldownEndTime",
        endTime.toString(),
      );
      window.localStorage.setItem("withdrawCooldownStarted", "true");
      setCooldownSeconds(COOLDOWN_DURATION);
      setCooldownStarted(true);
      return; // Don't execute withdraw on first click
    }

    // If cooldown has completed, execute withdraw
    if (cooldownStarted && cooldownSeconds === 0) {
      await handleWithdraw();
      // Reset cooldown state after successful withdraw
      setCooldownStarted(false);
      window.localStorage.removeItem("withdrawCooldownStarted");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const list = [
    {
      title: "Staked Amount",
      amount: stakingBalance + " ETH",
    },
    {
      title: "Available to Withdraw",
      amount: withdrawable + " ETH",
    },
    {
      title: "Pending Withdraw",
      amount: withdrawPending + " ETH",
    },
  ];

  const isWithdrawDisabled =
    withdrawable === "0.0000" || (cooldownStarted && cooldownSeconds > 0);

  return (
    <div className="space-y-6 flex flex-col items-center mt-10">
      <Card
        isBlurred
        className="border-none bg-background/60 dark:bg-default-100/50 w-[45vw] max-w-[800px]"
        shadow="sm"
      >
        <CardBody className="flex flex-col gap-8 items-center p-10">
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-4xl font-bold">Withdraw</h1>
            <h3 className="text-xl text-gray-400">
              Unstake and withdraw your ETH
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full">
            {list.map((item, index) => (
              <Card
                key={index}
                isBlurred
                className="border-none bg-background/60 dark:bg-default-100/50 w-full"
                shadow="sm"
              >
                <CardBody>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-light">{item.title}</h3>
                    <h1 className="text-3xl font-bold text-sky-800 text-shadow-2xs text-shadow-sky-300">
                      {item.amount}
                    </h1>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <h1 className="text-white text-2xl font-bold w-full">Unstake</h1>
          <NumberInput
            endContent={<div className="flex items-center text-xs">ETH</div>}
            label="Amount to Unstake"
            placeholder="0.00"
            size="lg"
            minValue={0}
            maxValue={+stakingBalance}
            value={unstakeAmount}
            onValueChange={(value) => setUnstakeAmount(value)}
          />
          <Button
            className="w-full  text-white text-shadow-2xs text-shadow-sky-300"
            color="default"
            startContent={<FiArrowUp className="w-6 h-6 sm:w-7 sm:h-7" />}
            variant="bordered"
            size="lg"
            onPress={handleUnstake}
            isLoading={isUnstakePending}
            isDisabled={!unstakeAmount}
          >
            Unstake ETH
          </Button>
          <h1 className="text-white text-2xl font-bold w-full">Withdraw</h1>
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 w-full"
          >
            <CardBody>
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-light">Ready to Withdraw</h3>
                  <h1 className="text-3xl font-bold text-sky-800 text-shadow-2xs text-shadow-sky-300">
                    {withdrawable} ETH
                  </h1>
                </div>
                <div className="w-1/2 text-right self-center text-gray-300 flex items-center justify-end gap-2">
                  <FiClock />
                  {cooldownSeconds > 0
                    ? `Cooldown: ${formatTime(cooldownSeconds)}`
                    : "20 min cooldown"}
                </div>
              </div>
            </CardBody>
          </Card>
          <Button
            className="w-full  text-white text-shadow-2xs text-shadow-sky-300"
            color="default"
            startContent={<FiArrowUp className="w-6 h-6 sm:w-7 sm:h-7" />}
            variant="bordered"
            size="lg"
            onPress={handleWithdrawClick}
            isLoading={isWithdrawPending}
            isDisabled={isWithdrawDisabled}
          >
            Withdraw ETH
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
