import BlogPost from "@/components/BlogPost";
import Header from "@/components/Header";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function BlogPostPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      <main className="flex-grow">
        <BlogPost />
      </main>
      <Footer />
    </div>
  );
}