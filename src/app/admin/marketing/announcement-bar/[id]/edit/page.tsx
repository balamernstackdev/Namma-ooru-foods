export const dynamicParams = true;
import EditAnnouncementClient from './EditAnnouncementClient';

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAnnouncementClient id={id} />;
}
