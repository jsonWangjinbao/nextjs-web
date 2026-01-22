import Connect from "@/components/connect";
// import CustomConnect from "@/components/custom-connect";
import AnimateCard from "@/components/animate/card";

export default function page() {
  return (
    <AnimateCard>
      <div className="h-full w-full overflow-hidden">
        <Connect />
        {/* <CustomConnect /> */}
      </div>
    </AnimateCard>
  );
}
