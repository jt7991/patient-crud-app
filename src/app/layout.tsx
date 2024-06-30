import NavLink from "@/components/NavLink";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { Inter as FontSans } from "next/font/google";
import Image from "next/image";
import Logo from "./svg/finni-logo.svg";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Finni - Traunero Medical Group",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider>
          <nav className="text-md flex flex-row items-center gap-6 border-2 border-x-0 border-b-slate-200 bg-background py-6 pl-4 font-medium">
            <Image src={Logo} alt="Finni logo" />
            <NavLink href="/patients" label="Patients" />
            <NavLink href="/admin" label="Admin" />
          </nav>
          <main className="h-full w-full bg-slate-50">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
