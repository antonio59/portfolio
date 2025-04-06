import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { auth } from "./lib/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProjectShowcase from "./components/ProjectShowcase";
import ProjectsGrid from "./components/ProjectsGrid";
import ProfessionalProjectsGrid from "./components/ProfessionalProjectsGrid";
import About from "./components/About";
import Experience from "./components/Experience";
// import Certifications from "./components/Certifications"; // Remove old import
import EducationAndCerts from "./components/EducationAndCerts"; // Import new combined component
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import AdminDashboard from "./components/admin/AdminDashboard";
import LoginForm from "./components/admin/LoginForm";
import NotFound from "./pages/not-found"; // Import directly
// Removed unused imports: useQuery, apiRequest

// Main portfolio homepage component (kept for reference, but not rendered)
const PortfolioHome = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
        <About />
        <ProjectShowcase />
        <ProfessionalProjectsGrid />
        <ProjectsGrid />
        <Experience />
        <EducationAndCerts /> {/* Use new combined component */}
        <Contact />
      </main>
      <Footer />
    </>
  );
};

// Admin area component (kept for reference, but not rendered)
interface AdminAreaProps {
  user: User | null;
  isLoadingAuth: boolean;
}
const AdminArea = ({ user, isLoadingAuth }: AdminAreaProps) => {
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  return user ? <AdminDashboard /> : <LoginForm />;
};


function App() {
  // Keep state logic for potential future use, but it won't affect rendering null
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false); 
      console.log("Auth State Changed:", currentUser ? currentUser.email : 'Logged out');
    });
    return () => unsubscribe();
  }, []); 

  // Return null to render nothing - isolating React/Vite setup
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={PortfolioHome} />
        {/* Restore AdminArea route */}
        <Route path="/admin">
          <AdminArea user={user} isLoadingAuth={isLoadingAuth} />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
