import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function GamePlayLayout({ children }: { children: ReactNode }) {
  return <div className="game-play-layout">{children}</div>;
}
