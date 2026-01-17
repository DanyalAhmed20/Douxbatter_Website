import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - DouxBatter',
  description: 'DouxBatter Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
