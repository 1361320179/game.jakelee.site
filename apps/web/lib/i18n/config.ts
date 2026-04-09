export const locales = ["en", "zh"] as const;

export type SiteLocale = (typeof locales)[number];

export const defaultLocale: SiteLocale = "en";

export const localeLabels: Record<SiteLocale, string> = {
  en: "EN",
  zh: "中文",
};

export function isLocale(value: string): value is SiteLocale {
  return locales.includes(value as SiteLocale);
}

export function getLocalizedPath(locale: SiteLocale, href = "/") {
  if (!href || href === "/") return `/${locale}`;
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

export function stripLocaleFromPathname(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (isLocale(maybeLocale)) {
    const nextPath = `/${rest.join("/")}`.replace(/\/+$/, "");
    return nextPath === "" ? "/" : nextPath;
  }
  return pathname || "/";
}

export function detectLocale(input: string | null | undefined): SiteLocale {
  const normalized = input?.toLowerCase() ?? "";

  if (normalized.startsWith("zh")) return "zh";
  if (normalized.startsWith("en")) return "en";

  return defaultLocale;
}
