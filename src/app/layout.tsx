import type { Metadata } from "next";
import { Montserrat, Raleway, Open_Sans, Nunito, Roboto } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const raleway = Raleway({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

const openSans = Open_Sans({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const nunito = Nunito({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rémy Thai - Portfolio",
  description: "Développeur informatique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${raleway.variable} ${openSans.variable} ${nunito.variable} ${roboto.variable} no-scrollbar`}
    >
      <body className="antialiased no-scrollbar">
        {children}
      </body>
    </html>
  );
}
