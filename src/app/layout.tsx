import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrainMate",
  description: "Transform your fitness journey with personalized training programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
