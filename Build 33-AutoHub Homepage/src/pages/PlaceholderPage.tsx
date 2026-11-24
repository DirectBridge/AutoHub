import { useEffect } from "react";
import { Construction } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/button";
import { UnverifiedBadge, VerifiedBadge } from "@/components/common/Badges";
import { roleLabel, useAuth } from "@/context/AuthContext";

export function PlaceholderPage({
  title,
  heading = title,
  children,
}: {
  title: string;
  heading?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} · 33-AutoHub`;
  }, [title]);
  return (
    <>
      <Navbar />
      <main>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted-soft text-primary">
            <Construction className="size-7" />
          </span>
          <h1 className="mt-5 text-[2rem] font-bold leading-10">{heading}</h1>
          {children}
          <p className="mt-2 text-text-secondary">Coming in a later part</p>
          <LinkButton href="/" variant="primary" className="mt-6">
            Back to home
          </LinkButton>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export function DashboardPlaceholder() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <PlaceholderPage title="Dashboard" heading={`Hi ${user.firstName}`}>
      <p className="mt-2 text-sm text-text-secondary">{user.email}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center rounded-full bg-navy-soft px-2.5 py-1 text-xs font-medium text-primary">
          {roleLabel[user.role]}
        </span>
        {user.isVerified ? <VerifiedBadge /> : <UnverifiedBadge />}
      </div>
    </PlaceholderPage>
  );
}
