import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function PublicLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}
