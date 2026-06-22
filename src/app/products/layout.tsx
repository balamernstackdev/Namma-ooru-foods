import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'namma ooru Collection | Authentic Heritage Products',
  description: 'Explore the complete collection of namma ooru\'s artisanal items. Authentic, traditional, and sourced directly from verified agrarian clusters.',
  openGraph: {
    title: 'namma ooru Collection',
    description: 'Explore the complete namma ooru traditional Product collection.',
    url: 'https://nammaoorufoods.com/products',
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
