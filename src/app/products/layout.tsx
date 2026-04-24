import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Namma Orru Collection | Authentic Heritage Harvests',
  description: 'Explore the complete collection of Namma Orru\'s artisanal items. Authentic, traditional, and sourced directly from verified agrarian clusters.',
  openGraph: {
    title: 'Namma Orru Collection',
    description: 'Explore the complete Namma Orru traditional harvest collection.',
    url: 'https://namma-urru-foods.web.app/products',
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
