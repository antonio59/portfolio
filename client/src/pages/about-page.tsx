/**
 * About Page - Full background, skills, certifications
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import About from "@/components/About";
import Resume from "@/components/Resume";

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="pt-20">
        <About />
        <Resume />
      </main>

      <Footer />
    </div>
  );
}
