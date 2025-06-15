
import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const navLinks = [
  { title: "Daily Quests", url: "/daily-quests" },
  { title: "Skill Tree", url: "/skill-tree" },
  { title: "Stats", url: "/stats" },
  { title: "Journal", url: "/journal" },
  { title: "Calendar", url: "/calendar" },
  { title: "Boss Fights", url: "/boss-fights" },
  { title: "Settings", url: "/settings" },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="text-lg font-bold tracking-widest uppercase font-serif">Shadow Ascendant</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-x-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.title}>
                <NavLink 
                  to={link.url} 
                  className={({isActive}) => `group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-accent text-accent-foreground' : 'bg-transparent'}`}
                >
                    {link.title}
                </NavLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
