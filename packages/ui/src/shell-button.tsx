import type { AnchorHTMLAttributes, ReactNode } from "react";

type ShellButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
};

export function ShellButton({
  children,
  className,
  href,
  variant = "primary",
  ...props
}: ShellButtonProps) {
  const classes = ["shell-button", `shell-button-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} href={href} {...props}>
      {children}
    </a>
  );
}
