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
    queryKey: ["/api/session"],
  });
  
  // Logout function
  const handleLogout = async () => {
    try {
      const response = await apiRequest("GET", "/api/logout");
      await response.json();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
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
  
  // Import data from antoniosmith.me
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  // Function to import sample content
  const handleImportContent = async () => {
    // Dynamically import to avoid loading this unnecessarily
    try {
      setIsImporting(true);
      const { importAllContent } = await import("@/utils/importData");
      const result = await importAllContent();
      setImportResult(result);
      
      // Show success or error message
      if (result.success) {
        toast({
          title: "Import successful",
          description: `Imported ${result.projects.count} projects, ${result.experiences.count} experiences, and ${result.sections.count} sections.`,
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      } else {
        toast({
          title: "Import failed",
          description: "Some content could not be imported. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Portfolio Admin Dashboard</h1>
          <div className="ml-4">
            <Button 
              variant="outline" 
              onClick={handleImportContent}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                "Import Sample Content"
              )}
            </Button>
          </div>
        </div>
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