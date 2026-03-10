import Link from "next/link";
import { FileText, Shield, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight">AptsWorks</h1>
        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Your documents,{" "}
          <span className="text-blue-500">safe in the cloud</span>
        </h2>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Secure cloud storage built for real estate professionals. Upload,
          organize, and access your documents from anywhere.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </Link>

        {/* Features */}
        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Cloud Storage</h3>
            <p className="text-sm text-muted-foreground">
              Upload PDFs, images, and works securely to the cloud.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Secure Access</h3>
            <p className="text-sm text-muted-foreground">
              Phone OTP login ensures only you can access your files.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border">
              <Smartphone className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Mobile First</h3>
            <p className="text-sm text-muted-foreground">
              Install as an app on your phone. Works offline too.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AptsWorks. All rights reserved.
      </footer>
    </div>
  );
}
