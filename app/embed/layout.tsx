// Minimal layout: embeds inherit html/body from app/layout.tsx
// but skip the locale shell (header, footer, search).

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-3">{children}</div>;
}
