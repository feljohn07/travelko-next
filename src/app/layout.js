import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Poppins, Pacifico } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

export const metadata = {
  title: {
    default: "TravelKo",
    template: "%s — TravelKo",
  },
  description:
    "Book verified tours and adventures across the Philippines with trusted coordinators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${pacifico.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}

