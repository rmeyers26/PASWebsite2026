export type NavLink = { href: string; label: string };
export type NavItem = { label: string; href?: string; children?: NavLink[] };

// Single source of truth for the site's primary navigation, shared by
// NavBar (header) and Footer so the two never drift out of sync.
//
// Seven top-level entries (six here plus the Join CTA). Grouping keeps the
// secondary reference pages reachable without competing with Events, Gallery,
// and Join, and gives /history and /leadership a home in the primary nav.
export const navItems: NavItem[] = [
  {
    label: 'About',
    children: [
      { href: '/about', label: 'About PAS' },
      { href: '/history', label: 'History' },
      { href: '/leadership', label: 'Club Leadership' },
      { href: '/press-releases', label: 'Press Releases' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  {
    label: 'Outreach',
    children: [
      { href: '/star-tours', label: 'Star Tours' },
      { href: '/telescope-workshops', label: 'Telescope Workshops' },
    ],
  },
  {
    label: 'Learn',
    children: [
      { href: '/learn', label: 'Learn Astronomy' },
      { href: '/sky-conditions', label: 'Sky Conditions' },
      { href: '/exoplanets', label: 'Exoplanets' },
    ],
  },
  {
    label: 'Groups',
    children: [
      { href: '/asig', label: 'Astro Imaging (ASIG)' },
      { href: '/bsig', label: 'Book Club (BSIG)' },
    ],
  },
];

export const joinCta: NavLink = { href: '/join', label: 'Join PAS' };
