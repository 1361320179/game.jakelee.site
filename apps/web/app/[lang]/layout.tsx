import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka, Press_Start_2P } from "next/font/google";
import "../../styles/globals.css";
import { getLocaleDictionary } from "../../lib/i18n/server";
import { locales } from "../../lib/i18n/config";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-press-start-2p",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fredoka",
  display: "swap",
});

type RootLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const { dictionary } = await getLocaleDictionary(lang);

  return {
    title: dictionary.site.title,
    description: dictionary.site.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { lang } = await params;

  return (
    <html lang={lang} className={`${pressStart2P.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
