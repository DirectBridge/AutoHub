import { useEffect, useState } from 'react';
import { ChevronDown, Heart, LogOut, Menu, MessageSquare, User, X } from 'lucide-react';
import { Container } from '../Container/Container';
import { Logo } from '../Logo/Logo';
import { Button, LinkButton } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Buy', href: '/search?type=sale' },
  { label: 'Rent', href: '/search?type=rent' },
  { label: 'Sell', href: '/sell' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Search', href: '/search' },
];

export function Navbar({ loggedIn: preview }) {
  const { user, logout } = useAuth();
  const loggedIn = preview ?? Boolean(user);
  const displayName = user ? `${user.firstName} ${user.lastName.charAt(0)}.` : 'Karim B.';
  const loginHref = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
  };

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isSearch = window.location.pathname === '/search';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={cn('sticky top-0 z-40 h-[4.5rem] border-b bg-surface/95 backdrop-blur-sm', scrolled && 'shadow-card')}>
        <Container className="flex h-full items-center justify-between">
          <Logo />
          <nav aria-label="Main navigation" className="hidden h-full items-center gap-7 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'relative flex h-full items-center text-sm font-medium text-primary hover:text-accent',
                  link.label === 'Search' && isSearch && 'text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-1.5 md:flex">
            {loggedIn ? (
              <>
                <LinkButton href="/messages" variant="ghost" aria-label="Messages" className="relative size-10 p-0">
                  <MessageSquare className="size-5" />
                  <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[0.625rem] text-white">3</span>
                </LinkButton>
                <LinkButton href="/dashboard/favorites" variant="ghost" aria-label="Favorites" className="size-10 p-0">
                  <Heart className="size-5" />
                </LinkButton>
                <LinkButton href="/sell" variant="accent" className="ml-2">Post a listing</LinkButton>
                <div className="relative ml-1">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1 rounded-full p-1 focus-visible:outline-2"
                    aria-label="Open account menu"
                    aria-expanded={menuOpen}
                  >
                    <Avatar name={displayName} src={user?.avatar ?? 'https://i.pravatar.cc/160?img=11'} size="sm" />
                    <ChevronDown className="size-4 text-secondary" />
                  </button>
                  {menuOpen && <AccountMenu onLogout={handleLogout} />}
                </div>
              </>
            ) : (
              <>
                <LinkButton href={loginHref} variant="ghost">Log in</LinkButton>
                <LinkButton href="/sell" variant="accent">Post a listing</LinkButton>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-6" />
          </Button>
        </Container>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-primary/35 md:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[min(22rem,88%)] flex-col bg-surface p-5 shadow-float"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-6" />
              </Button>
            </div>
            <nav className="mt-10 grid gap-1">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="rounded-button px-3 py-3 text-base font-semibold text-primary hover:bg-muted-soft">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto grid gap-3">
              {loggedIn ? (
                <Button variant="secondary" className="w-full" onClick={handleLogout}>
                  <LogOut className="size-4" /> Log out
                </Button>
              ) : (
                <LinkButton href={loginHref} variant="secondary" className="w-full">Log in</LinkButton>
              )}
              <LinkButton href="/sell" variant="accent" className="w-full">Post a listing</LinkButton>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function AccountMenu({ onLogout }) {
  const items = [
    ['Dashboard', '/dashboard'], ['My listings', '/dashboard/listings'],
    ['Messages', '/messages'], ['Favorites', '/dashboard/favorites'],
    ['Profile', '/settings'], ['Verification status', '/verification'],
  ];
  return (
    <div className="absolute right-0 top-12 w-56 rounded-card border bg-surface p-2 shadow-card-hover">
      {items.map(([item, href]) => (
        <a key={item} href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary hover:bg-muted-soft">
          <User className="size-4 text-secondary" />
          {item}
        </a>
      ))}
      <div className="my-1 border-t" />
      <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/5">
        <LogOut className="size-4" /> Log out
      </button>
    </div>
  );
}

