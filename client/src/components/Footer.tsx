import { motion } from "framer-motion";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="py-8 bg-primary border-t border-secondary">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <a href="#" className="text-lg font-semibold">John Doe</a>
            <p className="text-sm text-textColor/60 mt-1">Creative Developer</p>
          </div>
          
          <div className="text-sm text-textColor/60">
            &copy; {new Date().getFullYear()} John Doe. All rights reserved.
          </div>
          
          <div className="mt-6 md:mt-0">
            <motion.button 
              onClick={scrollToTop}
              className="inline-flex items-center text-accent hover:text-highlight transition-colors duration-300"
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="mr-2">Back to Top</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
