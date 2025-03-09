
import { ReactNode } from "react";
import NavBar from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-6 px-4 sm:px-6 md:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
