import { SiteHeader } from "../../../components/layout/site-header";
import { getLocaleDictionary } from "../../../lib/i18n/server";

type GamesPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function GamesPage({ params }: GamesPageProps) {
  const { lang } = await params;
  const { locale, dictionary } = await getLocaleDictionary(lang);

  return (
    <main style={{ padding: "48px 20px", color: "#f3f7fb" }}>
      <SiteHeader locale={locale} labels={dictionary.nav} />
      <h1>{dictionary.pages.gamesTitle}</h1>
      <p>{dictionary.pages.gamesBody}</p>
    </main>
  );
}
