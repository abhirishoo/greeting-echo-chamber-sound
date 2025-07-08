import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SwishViewLogo from "@/components/SwishViewLogo";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }), id: "home" },
  { label: "About", action: () => scrollToId("how-it-works"), id: "how-it-works" },
  { label: "Contact", action: () => scrollToId("details"), id: "details" },
];

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["how-it-works", "contact"];
      let current = "home";
      for (const id of sections) {
        const section = document.getElementById(id);
        if (section && window.scrollY >= section.offsetTop - 100) {
          current = id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 shadow-sm" : "bg-transparent backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <SwishViewLogo size="xl" />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map(({ label, action, id }) => (
              <button
                key={id}
                onClick={() => {
                  action();
                  setIsMenuOpen(false);
                }}
                className={`text-sm font-medium transition-colors ${
                  activeId === id
                    ? "text-orange-600 font-semibold"
                    : "text-gray-800 hover:text-orange-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Hamburger */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </Button>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-[64px] right-4 w-48 bg-white rounded-lg shadow-lg border py-2 z-50 transition-all duration-300 ease-in-out md:hidden">
              {navItems.map(({ label, action, id }) => (
                <button
                  key={id}
                  onClick={() => {
                    action();
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm ${
                    activeId === id
                      ? "text-orange-600 font-semibold"
                      : "text-gray-800 hover:text-orange-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
