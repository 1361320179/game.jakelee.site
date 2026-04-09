import "server-only";

import { notFound } from "next/navigation";
import { getDictionary } from "./dictionaries";
import { isLocale, locales, type SiteLocale } from "./config";

export async function requireLocale(locale: string) {
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function getLocaleDictionary(locale: string) {
  const resolvedLocale = await requireLocale(locale);

  return {
    locale: resolvedLocale,
    dictionary: await getDictionary(resolvedLocale),
  };
}

export function getLocaleAlternates(pathname = "/") {
  const cleanPath = pathname === "/" ? "" : pathname;
  return Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}${cleanPath}`]),
  ) as Record<SiteLocale, string>;
}
