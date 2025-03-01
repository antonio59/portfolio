import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
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
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import AdminDashboard from "./components/admin/AdminDashboard";
import LoginForm from "./components/admin/LoginForm";
import NotFound from "./pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";

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
        <ProjectShowcase />
        <ProfessionalProjectsGrid />
        <ProjectsGrid />
        <About />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

// Admin area with authentication
const AdminArea = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, navigate] = useLocation();
  
  // Check if user is already authenticated
  const { data: sessionData, isLoading } = useQuery({ 
    queryKey: ["/api/session"] 
  });
  
  // Effect to handle session data changes
  useEffect(() => {
    if (sessionData && typeof sessionData === 'object' && 'isAuthenticated' in sessionData) {
      setIsAuthenticated(!!sessionData.isAuthenticated);
    }
  }, [sessionData]);
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <AdminDashboard /> : <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={PortfolioHome} />
        <Route path="/admin" component={AdminArea} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
