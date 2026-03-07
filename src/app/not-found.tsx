import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound-root">
      <div className="notfound-inner">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-desc">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontSize: 14 }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}