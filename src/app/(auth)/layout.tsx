export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AptsWorks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure document storage for professionals
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
