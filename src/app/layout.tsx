import type { Metadata } from "next";
import "./globals.css";
import { AssistantWidget } from "@/components/AssistantWidget";

export const metadata: Metadata = {
  title: "Solutions Portfolio — Jose Luis Lainez Escoto",
  description:
    "Three AI agents you can click into and talk to: a live voice agent for an auto dealership, a chat agent for IoT support, and an email agent that edits e-commerce orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <AssistantWidget />
      </body>
    </html>
  );
}
