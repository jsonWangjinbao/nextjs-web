"use client";

import { Card, CardBody, Button } from "@heroui/react";
import useStakeContract from "@/hooks/useStakeContract";
import { FiArrowUp, FiInfo } from "react-icons/fi";

export default function Claim() {
  const {
    stakingBalance,
    pendingReward,
    lastUpdate,
    handleClaim,
    isClaimPending,
  } = useStakeContract();

  const list = [
    {
      title: "Pending Rewards",
      amount: pendingReward + " MetaNode",
    },
    {
      title: "Staked Amount",
      amount: stakingBalance + " ETH",
    },
    {
      title: "Last Update",
      amount: new Date(lastUpdate).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6 flex flex-col items-center mt-10">
      <Card
        isBlurred
        className="border-none bg-background/60 dark:bg-default-100/50 w-[45vw] max-w-[800px]"
        shadow="sm"
      >
        <CardBody className="flex flex-col gap-8 items-center p-10">
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-4xl font-bold">Claim Rewards</h1>
            <h3 className="text-xl text-gray-400">
              Claim your MetaNode rewards
            </h3>
          </div>
          <h1 className="text-white text-2xl font-bold w-full">
            Reward Statistics
          </h1>
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
          <h1 className="text-white text-2xl font-bold w-full">Claim Reward</h1>
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 w-full"
          >
            <CardBody>
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <FiInfo className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-2">How claiming works:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Rewards accumulate continuously while you stake</li>
                      <li>• You can claim rewards anytime</li>
                      <li>• Claimed rewards are sent to your wallet</li>
                      <li>• No minimum claim amount required</li>
                    </ul>
                  </div>
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
            onPress={handleClaim}
            isLoading={isClaimPending}
            isDisabled={!pendingReward}
          >
            Claim
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
