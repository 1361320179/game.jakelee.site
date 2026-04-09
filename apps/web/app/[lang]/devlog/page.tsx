import { SiteHeader } from "../../../components/layout/site-header";
import { getLocaleDictionary } from "../../../lib/i18n/server";

type DevlogPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function DevlogPage({ params }: DevlogPageProps) {
  const { lang } = await params;
  const { locale, dictionary } = await getLocaleDictionary(lang);

  return (
    <main style={{ padding: "48px 20px", color: "#f3f7fb" }}>
      <SiteHeader locale={locale} labels={dictionary.nav} />
      <h1>{dictionary.pages.devlogTitle}</h1>
      <p>{dictionary.pages.devlogBody}</p>
    </main>
  );
}
