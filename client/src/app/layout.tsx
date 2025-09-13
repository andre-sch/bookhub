import { Roboto } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "BookHub",
  description: "a library app"
};

const roboto = Roboto({
  subsets: ["latin"]
})

export default function RootLayout(props: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {props.children}
      </body>
    </html>
  );
}
