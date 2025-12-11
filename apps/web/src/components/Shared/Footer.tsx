import { Link } from "react-router";

const currentYear = new Date().getFullYear();

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/u/paulburke", label: "Paul Burke" },
  { href: "https://github.com/ipaulpro/palus", label: "GitHub" },
  { href: "/support", label: "Support" }
];

const Footer = () => {
  return (
    <footer className="flex flex-wrap gap-x-[12px] gap-y-2 px-3 text-sm lg:px-0">
      <span className="font-bold text-gray-500 dark:text-gray-200">
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
