import { Bebas_Neue, Inter, Geist } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/main/Smoothscroll";
import Navbar from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import ReduxProvider from "./ReduxProvider";
import { Toaster } from "react-hot-toast";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Solvestic",
  description: "Solvestic",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <ReduxProvider>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
            <Toaster
            // position="top-right"  
            />
          </SmoothScroll>
        </ReduxProvider>
      </body>
    </html>
  );
}