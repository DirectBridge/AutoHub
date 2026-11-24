import { useEffect } from "react";
import { ArrowLeft, BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const trustItems = [
  { icon: ShieldCheck, label: "Verified sellers" },
  { icon: Lock, label: "Private messaging" },
  { icon: BadgeCheck, label: "Moderated listings" },
];

export function AuthLayout({
  title,
  panelHeading,
  children,
}: {
  /** document.title prefix, e.g. "Log in". */
  title: string;
  /** Short line shown above the trust message on the photo panel. */
  panelHeading: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} · 33-AutoHub`;
  }, [title]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="relative hidden min-h-screen w-[45%] shrink-0 overflow-hidden bg-primary lg:block">
        <img
          src="/images/hero-autohub.png"
          alt=""
          className="absolute inset-0 size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30" />
        <div className="relative flex h-full min-h-screen flex-col justify-between p-10 xl:p-12">
          <Logo light />
          <div className="max-w-md text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">
              {panelHeading}
            </p>
            <p className="mt-4 text-2xl font-semibold leading-9">
              “Every verified seller is checked by our team.”
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-footer-text">
              {trustItems.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4 text-accent-soft" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-surface px-4 lg:h-auto lg:justify-end lg:border-0 lg:bg-transparent lg:px-8 lg:pt-6">
          <Logo className="lg:hidden" />
          <a
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-button px-3 text-sm font-semibold text-primary hover:bg-muted-soft"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </a>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 py-8 lg:items-center lg:px-8 lg:py-12">
          <div className="w-full max-w-[27.5rem] rounded-modal border bg-surface p-6 sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="text-[2rem] font-bold leading-10 text-text-primary">{title}</h1>
      {subtitle && <p className="mt-2 text-base leading-6 text-text-secondary">{subtitle}</p>}
    </div>
  );
}

export function AuthSwitch({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-center text-sm text-text-secondary">{children}</p>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-semibold text-accent underline-offset-4 hover:text-accent-hover hover:underline"
    >
      {children}
    </a>
  );
}
