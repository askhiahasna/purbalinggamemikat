// Template dirender ulang pada setiap navigasi: memberi transisi halus saat berpindah halaman.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
