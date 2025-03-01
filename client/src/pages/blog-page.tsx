import BlogList from "@/components/BlogList";
import Header from "@/components/Header";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      <main className="flex-grow">
        <BlogList />
      </main>
      <Footer />
    </div>
  );
}