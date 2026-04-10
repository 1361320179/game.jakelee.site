import { getLocaleDictionary } from "../../../../lib/i18n/server";
import { GameContainer } from "../../../../components/game/GameContainer";

type GameDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { lang, slug } = await params;

  return (
    <GameContainer slug={slug} backHref={`/${lang}/games`} />
  );
}
