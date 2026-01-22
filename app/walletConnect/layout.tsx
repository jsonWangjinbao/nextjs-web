export default function WalletConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-[calc(100vh-8rem)]">
      <div className="h-[calc(100vh-10rem)] flex-1 overflow-y-auto p-5  mt-8 rounded-lg mr-5 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
