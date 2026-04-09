import { SiteHeader } from "../../../../components/layout/site-header";
import { getLocaleDictionary } from "../../../../lib/i18n/server";

type GameDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { lang, slug } = await params;
  const { locale, dictionary } = await getLocaleDictionary(lang);

  return (
    <main style={{ padding: "48px 20px", color: "#f3f7fb" }}>
      <SiteHeader locale={locale} labels={dictionary.nav} />
      <h1>{slug}</h1>
      <p>{dictionary.pages.gameDetailBody}</p>
    </main>
  );
}
