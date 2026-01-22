"use client";

import { NumberInput, Card, CardBody, Button } from "@heroui/react";
import { FiArrowDown, FiZap, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

import useStakeContract from "@/hooks/useStakeContract";

export default function Stake() {
  const {
    data,
    isError,
    isLoading,
    stakeAmount,
    setStakeAmount,
    availableETH,
    stakingBalance,
    isStakePending,
    handleStake,
  } = useStakeContract();

  return (
    <div className="space-y-6 flex flex-col items-center mt-10">
      <Card
        isBlurred
        className="border-none bg-background/50 dark:bg-default-100/50 w-[45vw] max-w-[800px]"
        shadow="sm"
      >
        <CardBody className="flex flex-col gap-8 items-center p-10 ">
          <div className="flex flex-col gap-2 items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-24 h-24 rounded-full border-2 border-primary-500/20 flex items-center justify-center shadow-xl"
              style={{ boxShadow: "0 0 60px 0 rgba(14,165,233,0.15)" }}
            >
              <FiZap className="w-12 h-12 text-primary-500" />
            </motion.div>
            <h1 className="text-4xl font-bold">MetaNode Stake</h1>
            <h3 className="text-xl text-gray-400">Stake ETH to earn tokens</h3>
          </div>
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 w-full"
            shadow="sm"
          >
            <CardBody>
              <div className="flex items-center gap-8 justify-center">
                <div className="shrink-0 flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-primary-500/10 rounded-full">
                  <FiTrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl">Staked Amount</h3>
                  <h1 className="text-6xl font-bold text-sky-800 text-shadow-2xs text-shadow-sky-300">
                    {stakingBalance} ETH
                  </h1>
                </div>
              </div>
            </CardBody>
          </Card>
          <NumberInput
            endContent={<div className="flex items-center text-xs">ETH</div>}
            label="Amount to Stake"
            placeholder="0.00"
            minValue={0}
            maxValue={+availableETH}
            description={
              isLoading
                ? "Loading..."
                : isError
                ? "Error fetching balance"
                : `Available: ${availableETH} ${data?.symbol}`
            }
            size="lg"
            value={stakeAmount}
            onValueChange={(value) => setStakeAmount(value)}
          />
          <Button
            className="w-full text-xl text-white text-shadow-2xs text-shadow-sky-300"
            color="default"
            startContent={<FiArrowDown className="w-6 h-6 sm:w-7 sm:h-7" />}
            variant="bordered"
            size="lg"
            onPress={handleStake}
            isLoading={isStakePending}
            isDisabled={!stakeAmount}
          >
            Stake ETH
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
