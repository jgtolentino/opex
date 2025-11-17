// app/layout.tsx
import "./../styles/globals.css";
import { ReactNode } from "react";
import Providers from "@components/Providers";

export const metadata = {
  title: "InsightPulse Admin Shell",
  description: "Unified admin console for InsightPulse AI stack"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
