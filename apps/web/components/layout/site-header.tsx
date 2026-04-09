"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getLocalizedPath,
  localeLabels,
  locales,
  stripLocaleFromPathname,
  type SiteLocale,
} from "../../lib/i18n/config";

type SiteHeaderProps = {
  locale: SiteLocale;
  labels: {
    home: string;
    games: string;
    devlog: string;
    about: string;
    languageSwitcher: string;
  };
};

const navItems = [
  { key: "home", href: "/" },
  { key: "games", href: "/games" },
  { key: "devlog", href: "/devlog" },
  { key: "about", href: "/about" },
] as const;

export function SiteHeader({ locale, labels }: SiteHeaderProps) {
  const pathname = usePathname();
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  return (
    <header className="site-header">
      <Link
        href="https://www.jakelee.site"
        className="site-header-brand"
        target="_blank"
        rel="noreferrer"
      >
        www.jakelee.site
      </Link>

      <nav className="site-header-nav" aria-label="Main">
        {navItems.map((item) => {
          const label = labels[item.key];
          const active =
            item.href === "/"
              ? pathnameWithoutLocale === "/"
              : pathnameWithoutLocale.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={getLocalizedPath(locale, item.href)}
              className={active ? "is-active" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="site-header-locale" aria-label={labels.languageSwitcher}>
        {locales.map((targetLocale) => (
          <Link
            key={targetLocale}
            href={getLocalizedPath(targetLocale, pathnameWithoutLocale)}
            className={targetLocale === locale ? "is-active" : undefined}
          >
            {localeLabels[targetLocale]}
          </Link>
        ))}
      </div>
    </header>
  );
}
