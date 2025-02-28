import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsManager from "./ProjectsManager";
import ExperienceManager from "./ExperienceManager";
import SectionsManager from "./SectionsManager";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const { toast } = useToast();
  
  // Check session status
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => apiRequest("/api/session"),
  });
  
  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest("/api/logout", { method: "GET" });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Something went wrong during logout.",
        variant: "destructive",
      });
    }
  };
  
  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="sections">Content Sections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>
          
          <TabsContent value="experience">
            <ExperienceManager />
          </TabsContent>
          
          <TabsContent value="sections">
            <SectionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}