import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProjectShowcase from "./components/ProjectShowcase";
import ProjectsGrid from "./components/ProjectsGrid";
import ProfessionalProjectsGrid from "./components/ProfessionalProjectsGrid";
import About from "./components/About";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <CustomCursor />
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      <main>
        <Hero />
        <ProjectShowcase />
        <ProfessionalProjectsGrid />
        <ProjectsGrid />
        <About />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
