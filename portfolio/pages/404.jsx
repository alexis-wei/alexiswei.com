"use client";
import Custom404 from "@/components/404";
import "@/app/globals.css";
import { Libre_Baskerville } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  weight: ["700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

export default function Page() {
  return (
    <div className={`${libreBaskerville.variable} antialiased`}>
      <Custom404 />
    </div>
  );
}
