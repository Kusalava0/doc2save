import Link from "next/link";
import { FileText, Shield, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Doc2Save</h1>
        <Link
          href="/login"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
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
        <p className="mt-4 max-w-lg text-lg text-zinc-400">
          Secure cloud storage built for real estate professionals. Upload,
          organize, and access your documents from anywhere.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-lg bg-white px-8 py-3 text-base font-semibold text-black transition-colors hover:bg-zinc-200"
        >
          Get Started
        </Link>

        {/* Features */}
        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Cloud Storage</h3>
            <p className="text-sm text-zinc-400">
              Upload PDFs, images, and documents securely to the cloud.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Secure Access</h3>
            <p className="text-sm text-zinc-400">
              Phone OTP login ensures only you can access your files.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <Smartphone className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold">Mobile First</h3>
            <p className="text-sm text-zinc-400">
              Install as an app on your phone. Works offline too.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} Doc2Save. All rights reserved.
      </footer>
    </div>
  );
}
