import type { FooterContent } from "@game/content";

type SiteFooterProps = {
  footer: FooterContent;
};

export function SiteFooter({ footer }: SiteFooterProps) {
  return (
    <footer className="site-footer" id="footer">
      <div>
        <p className="footer-title">{footer.title}</p>
        <p className="footer-copy">{footer.copy}</p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        {footer.links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
