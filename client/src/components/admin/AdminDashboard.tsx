import { useState } from "react";
// Removed useQuery, apiRequest, queryClient imports
import { auth } from "@/lib/firebaseConfig"; // Import Firebase auth
import { signOut } from "firebase/auth"; // Import Firebase signOut
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsManager from "./ProjectsManager";
import ExperienceManager from "./ExperienceManager";
// import SectionsManager from "./SectionsManager"; // Remove SectionsManager import
// import CertificationsManager from "./CertificationsManager"; // Remove old import
import EducationCertManager from "./EducationManager"; // Rename import to reflect component name
import AboutManager from "./AboutManager"; // Import the new AboutManager
import HeroManager from "./HeroManager"; // Import the new HeroManager
import ContactManager from "./ContactManager"; // Import the new ContactManager
import BlogManager from "./BlogManager"; // Import the existing BlogManager
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { LogOut, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects"); // Keep default or change if needed
  const { toast } = useToast();
  
  // Session check is now handled globally in App.tsx
  // Removed sessionData and sessionLoading useQuery
  // Logout function with redirection to home page
  const handleLogout = async () => {
    try {
      await signOut(auth); // Use Firebase signOut
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // No need to manually redirect, onAuthStateChanged in App.tsx will handle UI update
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Something went wrong during logout.",
        variant: "destructive",
      });
    }
  };
  
  // Removed loading state based on sessionLoading
  
  // Removed state related to old import/sync functionality
  
  // Removed old import/sync handler functions (handleImportContent, handleSyncFrontendData, handleImportSpecializedProjects)
  // These relied on backend API calls and are not compatible with the current Firestore setup.
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Portfolio Admin Dashboard</h1>
          {/* Removed Import/Sync buttons */}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Adjust grid columns for new tabs */}
          <TabsList className="grid grid-cols-7 mb-8"> {/* Increased columns */}
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="educationCerts">Education & Certs</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger> {/* Add Blog if needed */}
          </TabsList>
          
          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>
          
          <TabsContent value="experience">
            <ExperienceManager />
          </TabsContent>
          
          {/* Remove Certifications Content */}
          {/* <TabsContent value="certifications">
            <CertificationsManager />
          </TabsContent> */}

          {/* Combined Content Tab */}
          <TabsContent value="educationCerts">
            <div> {/* Wrap the manager component */}
              <EducationCertManager /> {/* Use the combined manager */}
            </div>
          </TabsContent>
          
          {/* Remove Sections Content */}
          {/* <TabsContent value="sections">
             <SectionsManager />
          </TabsContent> */}

          {/* Add new TabsContent for promoted sections */}
          <TabsContent value="hero">
            <HeroManager /> {/* Use the HeroManager component */}
          </TabsContent>
          <TabsContent value="about">
            <AboutManager /> {/* Use the AboutManager component */}
          </TabsContent>
          <TabsContent value="contact">
             <ContactManager /> {/* Use the ContactManager component */}
          </TabsContent>
          <TabsContent value="blog">
             <BlogManager /> {/* Use the existing BlogManager component */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}