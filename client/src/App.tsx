import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedProjects from "./components/FeaturedProjects";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import NotFound from "./pages/not-found";
import AboutPage from "./pages/about-page";
import ContactPage from "./pages/contact-page";
import BlogPage from "./pages/blog-page";
import BlogPostPage from "./pages/blog-post-page";
import SubmitTestimonial from "./pages/submit-testimonial";
import ProjectsPage from "./pages/projects-page";
import CredentialsPage from "./pages/credentials-page";

// New admin pages
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminBlog from "./pages/admin/blog";
import AdminProfile from "./pages/admin/profile";
import AdminProjects from "./pages/admin/projects";
import AdminExperiences from "./pages/admin/experiences";
import AdminCertifications from "./pages/admin/certifications";

// Main portfolio homepage component
const PortfolioHome = () => {
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
    <>
      <CustomCursor />
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <main>
        <Hero />
        <FeaturedProjects />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
};



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={PortfolioHome} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/credentials" component={CredentialsPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/testimonial" component={SubmitTestimonial} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/profile" component={AdminProfile} />
        <Route path="/admin/projects" component={AdminProjects} />
        <Route path="/admin/experiences" component={AdminExperiences} />
        <Route path="/admin/certifications" component={AdminCertifications} />
        
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
