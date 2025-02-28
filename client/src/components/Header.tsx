import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function Header({ isMobileMenuOpen, toggleMobileMenu }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-40 py-6 transition-all duration-300 ${
        scrolled ? "bg-primary/80 backdrop-blur-md shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-lg font-semibold tracking-tight">John Doe</a>
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li><a href="#work" className="hover:text-accent transition-colors duration-300">Work</a></li>
            <li><a href="#about" className="hover:text-accent transition-colors duration-300">About</a></li>
            <li><a href="#contact" className="hover:text-accent transition-colors duration-300">Contact</a></li>
          </ul>
        </nav>
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden focus:outline-none" 
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none" 
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-primary z-50 flex flex-col justify-center items-center"
      >
        <button 
          onClick={toggleMobileMenu}
          className="absolute top-6 right-6 focus:outline-none" 
          aria-label="Close Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav>
          <ul className="flex flex-col space-y-6 text-center">
            <motion.li
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isMobileMenuOpen ? 0 : 10, opacity: isMobileMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <a 
                href="#work" 
                className="text-2xl hover:text-accent transition-colors duration-300"
                onClick={toggleMobileMenu}
              >
                Work
              </a>
            </motion.li>
            <motion.li
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isMobileMenuOpen ? 0 : 10, opacity: isMobileMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <a 
                href="#about" 
                className="text-2xl hover:text-accent transition-colors duration-300"
                onClick={toggleMobileMenu}
              >
                About
              </a>
            </motion.li>
            <motion.li
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isMobileMenuOpen ? 0 : 10, opacity: isMobileMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <a 
                href="#contact" 
                className="text-2xl hover:text-accent transition-colors duration-300"
                onClick={toggleMobileMenu}
              >
                Contact
              </a>
            </motion.li>
          </ul>
        </nav>
      </motion.div>
    </header>
  );
}
