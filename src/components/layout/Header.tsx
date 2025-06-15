
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Settings, Home } from "lucide-react";
import { HashLink } from "react-router-hash-link";

const navLinks = [
  { title: "Daily Quests", url: "/daily-quests" },
  { title: "Skill Tree", url: "/skill-tree" },
  { title: "Calendar", url: "/calendar" },
  { title: "Shadow Trials", url: "/#shadow-trials" },
  { title: "Weekly Summary", url: "/#weekly-summary" },
];

const Header = () => {
  const location = useLocation();

  const navLinkClassName = `group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link
            to="/"
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-x-2">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  {link.url.includes("#") ? (
                    <HashLink
                      to={link.url}
                      smooth
                      className={`${navLinkClassName} ${
                        location.pathname === "/" &&
                        location.hash === link.url.substring(1)
                          ? "bg-accent text-accent-foreground"
                          : "bg-transparent"
                      }`}
                    >
                      {link.title}
                    </HashLink>
                  ) : (
                    <NavLink
                      to={link.url}
                      className={({ isActive }) =>
                        `${navLinkClassName} ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "bg-transparent"
                        }`
                      }
                    >
                      {link.title}
                    </NavLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Link
          to="/settings"
          className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
