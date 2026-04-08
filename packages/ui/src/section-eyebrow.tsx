type SectionEyebrowProps = {
  label: string;
};

export function SectionEyebrow({ label }: SectionEyebrowProps) {
  return <span className="section-eyebrow">{label}</span>;
}
