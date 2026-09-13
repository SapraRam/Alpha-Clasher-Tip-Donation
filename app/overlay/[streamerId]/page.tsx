import OverlayPage from "@/components/overlay-page";

type Props = {
  params: Promise<{ streamerId: string }>;
  searchParams: Promise<{ token?: string; debug?: string; obs?: string }>;
};

export default async function OverlayRoutePage({ params, searchParams }: Props) {
  const { streamerId } = await params;
  const { token, debug, obs } = await searchParams;

  return (
    <OverlayPage
      streamerId={streamerId}
      token={token ?? ""}
      debug={debug === "1"}
      obs={obs === "1"}
    />
  );
}
