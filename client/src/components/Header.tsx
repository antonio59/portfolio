import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function Header({
  isMobileMenuOpen,
  toggleMobileMenu,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Navigation links (ordered: About, Projects, Contact, Writing)
  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/#contact" },
  ];

  // Additional links (Writing instead of Blog)
  const additionalLinks = [{ name: "Writing", href: "/blog" }];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/95 backdrop-blur-sm shadow-sm"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo - clicking name goes home */}
        <Link href="/" className="text-2xl font-bold text-textColor hover:text-accentColor transition-colors cursor-pointer">
          {scrolled ? "AS." : "Antonio Smith"}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-10">
            {navLinks.map((link, index) => (
              <li key={index}>
                {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-accentColor transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-accentColor transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
            {additionalLinks.map((link, index) => (
              <li key={`additional-${index}`}>
                <Link
                  href={link.href}
                  className="text-gray-600 hover:text-accentColor transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none z-20"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <div
              className={`absolute w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "rotate-45 top-3" : "top-1"}`}
            ></div>
            <div
              className={`absolute w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-0" : "opacity-100"} top-3`}
            ></div>
            <div
              className={`absolute w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "-rotate-45 top-3" : "top-5"}`}
            ></div>
          </div>
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[70%] bg-white z-10 shadow-xl"
            >
              <div className="flex flex-col h-full justify-center p-8">
                <nav>
                  <ul className="space-y-8">
                    {navLinks.map((link, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <a
                          href={link.href}
                          className="text-2xl font-medium text-gray-700 hover:text-accentColor transition-colors duration-300"
                          onClick={toggleMobileMenu}
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                    {additionalLinks.map((link, index) => (
                      <motion.li
                        key={`additional-mobile-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + index) * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className="text-2xl font-medium text-gray-700 hover:text-accentColor transition-colors duration-300"
                          onClick={toggleMobileMenu}
                        >
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-auto pt-8 border-t border-gray-200">
                  <p className="text-gray-600 mb-4">Get in touch</p>
                  <a
                    href="mailto:contact@example.com"
                    className="text-accentColor hover:text-highlightColor transition-colors duration-300"
                  >
                    contact@example.com
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-0 md:hidden"
              onClick={toggleMobileMenu}
            />
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
