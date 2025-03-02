import { memo } from 'react';
import Header from "@/components/common/Header";
const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-[100vh] flex flex-col">
      <Header></Header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default memo(Layout);
