import { Banner, Footer, Navbar } from "@/components/root";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="w-full">
      {/* <Banner /> */}
      <Navbar />
      <section className="flex flex-1 min-h-screen bg-background font-sans antialiased">
        <Outlet />
      </section>
      <Footer />
    </div>
  );
};

export default RootLayout;
