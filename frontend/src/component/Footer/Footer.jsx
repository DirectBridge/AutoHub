import { Camera, Globe2, Share2 } from 'lucide-react';
import { Container } from '../Container/Container';
import { Logo } from '../Logo/Logo';

const columns = [
  { title: 'Marketplace', links: ['Buy a car', 'Rent a car', 'Sell your car', 'Browse by body type'] },
  { title: 'Company', links: ['About', 'How it works', 'Trust & safety', 'Contact'] },
  { title: 'Support', links: ['Help center', 'Report a problem', 'Terms', 'Privacy'] },
];

export function Footer() {
  return (
    <footer className="bg-primary text-footer-text">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-6">The trusted way to buy, rent and sell cars in Algeria.</p>
            <div className="mt-6 flex gap-2">
              {[Globe2, Camera, Share2].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={['Website', 'Photo community', 'Social feed'][index]}
                  className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{column.title}</h3>
              <ul className="grid gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 33-AutoHub. All rights reserved.</p>
          <label className="flex items-center gap-2">
            Language
            <select className="rounded-button border-white/20 bg-primary px-3 py-2 text-white">
              <option>English</option>
              <option>Français</option>
              <option>العربية</option>
            </select>
          </label>
        </div>
      </Container>
    </footer>
  );
}

