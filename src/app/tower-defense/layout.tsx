import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tower Defense | Rémy Thai',
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}