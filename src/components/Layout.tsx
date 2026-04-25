import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-gradient-soft">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
