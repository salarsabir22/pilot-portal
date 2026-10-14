import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <p>Private pilot for 25 students.</p>
        <Link href="/admin" className="underline-offset-4 hover:text-foreground hover:underline">
          Founder
        </Link>
      </div>
    </footer>
  );
}
