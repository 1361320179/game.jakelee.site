type GameDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;

  return (
    <main style={{ padding: "48px 20px", color: "#f3f7fb" }}>
      <h1>{slug}</h1>
      <p>Game detail placeholder. Use this route for the marketing shell and embedded game container.</p>
    </main>
  );
}
