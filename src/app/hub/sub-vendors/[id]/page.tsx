export const dynamicParams = true;
import ClientPage from './client';

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Await params to satisfy Next.js 15+ async params requirement
  await params;
  return <ClientPage />;
}
