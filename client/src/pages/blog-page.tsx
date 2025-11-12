import BlogGrid from "@/components/BlogGrid";
import Header from "@/components/Header";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <main className="flex-grow pt-20">
        <BlogGrid />
      </main>
      <Footer />
    </div>
  );
}
