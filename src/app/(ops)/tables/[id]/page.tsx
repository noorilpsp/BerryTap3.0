import { redirect } from "next/navigation";

export default async function LegacyTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/table/${encodeURIComponent(id)}`);
}
