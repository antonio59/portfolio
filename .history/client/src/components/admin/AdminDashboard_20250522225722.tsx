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
import { LogOut, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [_isImporting, _setIsImporting] = useState(false);
  const [_importResult, _setImportResult] = useState<any>(null);
  const [_isSyncing, _setIsSyncing] = useState(false);
  const [_syncResult, _setSyncResult] = useState<any>(null);
  const [_isImportingSpecialized, _setIsImportingSpecialized] = useState(false);
  const [_specializedImportResult, _setSpecializedImportResult] = useState<any>(null);
  const { toast } = useToast();

  // Check session status
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
      // Redirect to home page
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

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Function to import sample content
  const handleImportContent = async () => {
    // Dynamically import to avoid loading this unnecessarily
    try {
      _setIsImporting(true);
      const { importAllContent } = await import("@/utils/importData");
      const result = await importAllContent();
      _setImportResult(result);

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
          description:
            "Some content could not be imported. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logger.error("Import error:", errorMessage);
      toast({
        title: "Import error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      _setIsImporting(false);
    }
  };

  // Function to sync frontend data with admin
  const handleSyncFrontendData = async () => {
    try {
      _setIsSyncing(true);
      const { syncAllData } = await import("@/utils/syncFrontendData");
      const result = await syncAllData();
      _setSyncResult(result);

      // Show success or error message
      if (result.success) {
        // Check if specialized projects were imported
        const specializedCount = result.specializedProjects?.count || 0;
        const specializedMsg =
          specializedCount > 0
            ? ` (including ${specializedCount} app & project management projects)`
            : "";

        toast({
          title: "Sync successful",
          description: `Synced ${result.projects.count} projects${specializedMsg}, ${result.experiences.count} experiences, and ${result.sections.count} sections.`,
        });

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      } else {
        toast({
          title: "Sync failed",
          description:
            "Some frontend content could not be synced. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logger.error("Sync error:", errorMessage);
      toast({
        title: "Sync error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      _setIsSyncing(false);
    }
  };

  // Function to import specialized app and project management projects
  const handleImportSpecializedProjects = async () => {
    try {
      _setIsImportingSpecialized(true);
      const { importAllSpecializedProjects } = await import(
        "@/utils/importPersonalProjects"
      );
      const result = await importAllSpecializedProjects();
      _setSpecializedImportResult(result);

      // Show success or error message
      if (result.success) {
        toast({
          title: "Import successful",
          description: `Imported ${result.personal.count} app development projects and ${result.professional.count} project management projects.`,
        });

        // Refresh projects data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      } else {
        toast({
          title: "Import failed",
          description:
            "Some projects could not be imported. Check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (process.env['NODE_ENV'] === "development") {
        console.error("Specialized import error:", error);
      }
      toast({
        title: "Import error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      _setIsImportingSpecialized(false);
    }
  };

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
