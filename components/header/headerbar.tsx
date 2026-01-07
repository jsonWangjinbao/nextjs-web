import User from "../user";
import HeaderMenu from "./headerMenu";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function Headerbar() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-800 text-xl font-bold px-6">
      <h1 className="text-2xl font-bold w-64 flex items-center gap-2">
        <AcmeLogo />
        My-App
      </h1>
      <div>
        <HeaderMenu />
      </div>
      <User />
    </div>
  );
}
