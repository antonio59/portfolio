import BlogList from "@/components/BlogList";
import BlogHeader from "@/components/BlogHeader";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      <main className="flex-grow pt-20">
        <BlogList />
      </main>
      <Footer />
    </div>
  );
}