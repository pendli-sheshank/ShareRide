import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SawaariShare Admin",
  description: "Admin panel for SawaariShare carpool platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="nav-links">
            <Link href="/" className="nav-brand">
              SawaariShare Admin
            </Link>
            <Link href="/">Dashboard</Link>
            <Link href="/reports">Reports</Link>
            <Link href="/users">Users</Link>
            <Link href="/communities">Communities</Link>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
