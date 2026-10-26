
import { Bebas_Neue, Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import SmoothScroll from "@/components/main/Smoothscroll";
import Navbar from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import ReduxProvider from "./ReduxProvider";
import { Toaster } from "react-hot-toast";

const FACEBOOK_PIXEL_ID = "1427812482199666";
const GA_MEASUREMENT_ID = "G-1YF72QB6ZD";
const GTM_ID = "GTM-MG5FJN2G";

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
  title: "Solvestic | Brightening Skincare & Hydration Essentials",
  description:
    "Discover Solvestic skincare essentials for brighter, smoother, hydrated-looking skin. Explore pigment-correcting face cleanser, bouncy moisturiser and daily skincare combos.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${geistSans.variable} ${inter.variable}`}
    >
      <head>
        {/* ================= FACEBOOK PIXEL ================= */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){
              n.callMethod?
              n.callMethod.apply(n,arguments):
              n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
              }(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              fbq('init', '${FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* ================= GOOGLE ANALYTICS GA4 ================= */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];

              function gtag(){
                dataLayer.push(arguments);
              }

              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />

        {/* ================= GOOGLE TAG MANAGER ================= */}
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({
                  'gtm.start': new Date().getTime(),
                  event:'gtm.js'
                });

                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';

                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;

                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col">
        {/* ================= GTM NOSCRIPT ================= */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
            title="Google Tag Manager"
          />
        </noscript>

        {/* ================= FACEBOOK PIXEL NOSCRIPT ================= */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <ReduxProvider>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </SmoothScroll>
        </ReduxProvider>
      </body>
    </html>
  );
}
