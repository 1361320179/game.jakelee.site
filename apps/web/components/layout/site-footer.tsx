import Link from "next/link";
import type { FooterContent } from "@game/content";
import { getLocalizedPath, type SiteLocale } from "../../lib/i18n/config";

type SiteFooterProps = {
  locale: SiteLocale;
  footer: FooterContent;
};

export function SiteFooter({ locale, footer }: SiteFooterProps) {
  return (
    <footer className="site-footer" id="footer">
      <div>
        <p className="footer-title">{footer.title}</p>
        <p className="footer-copy">{footer.copy}</p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        {footer.links.map((link) => (
          link.href.startsWith("/") ? (
            <Link key={link.label} href={getLocalizedPath(locale, link.href)}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          )
        ))}
      </nav>
    </footer>
  );
}
