import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { logger } from "@/lib/logger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsManager from "./ProjectsManager";
import ExperienceManager from "./ExperienceManager";
import SectionsManager from "./SectionsManager";
import CertificationsManager from "./CertificationsManager";
import BlogManager from "./BlogManager";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const { toast } = useToast();
  const { data: _sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/session"],
  });

  // Logout function with redirection to home page
  const handleLogout = async () => {
    try {
      const response = await apiRequest("GET", "/api/logout");
      await response.json();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      window.location.href = "/";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logger.error("Logout error:", errorMessage);
      toast({
        title: "Logout failed",
        description: "Something went wrong during logout.",
        variant: "destructive",
      });
    }
  };

  const queryClient = () => {
    // Example usage of queryClient
    console.info('Using queryClient');
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Portfolio Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="sections">Content Sections</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceManager />
          </TabsContent>
          <TabsContent value="certifications">
            <CertificationsManager />
          </TabsContent>
          <TabsContent value="sections">
            <SectionsManager />
          </TabsContent>
          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
