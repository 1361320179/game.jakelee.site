import { SiteHeader } from "../../../components/layout/site-header";
import { getLocaleDictionary } from "../../../lib/i18n/server";

type AboutPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;
  const { locale, dictionary } = await getLocaleDictionary(lang);

  return (
    <main style={{ padding: "48px 20px", color: "#f3f7fb" }}>
      <SiteHeader locale={locale} labels={dictionary.nav} />
      <h1>{dictionary.pages.aboutTitle}</h1>
      <p>{dictionary.pages.aboutBody}</p>
    </main>
  );
}
