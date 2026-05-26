import { Link } from "react-router";

const currentYear = new Date().getFullYear();

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/u/palus", label: "@palus" },
  { href: "https://github.com/ipaulpro/palus", label: "GitHub" },
  { href: "/support", label: "Support" },
  { href: "https://lens.xyz", label: "Lens" }
];

const Footer = () => {
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-[12px] gap-y-2 px-3 text-sm sm:justify-start lg:px-0">
      <span className="font-bold text-secondary">
        &copy; {currentYear} Palus.app
      </span>
      {links.map(({ href, label }) => (
        <Link
          className="outline-offset-4"
          key={href}
          rel="noreferrer noopener"
          target={href.startsWith("http") ? "_blank" : undefined}
          to={href}
        >
          {label}
        </Link>
      ))}
    </footer>
  );
};

export default Footer;
