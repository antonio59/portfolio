import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added useQueryClient
// Removed apiRequest import
import { db } from "@/lib/firebaseConfig"; // Import Firestore instance
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp // Import Timestamp for potential date fields
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Star, GripVertical } from "lucide-react";
// Assuming Project type can handle string id or we adapt it
import type { Project as ProjectSchemaType } from "@shared/schema";

// Define Firestore Project type including string ID
// Define Firestore Project type by omitting the original ID and adding the string ID
interface Project extends Omit<ProjectSchemaType, 'id'> {
  id: string; // Firestore uses string IDs
}

// Define Firestore collection reference
const projectsCollectionRef = collection(db, "projects");

// Form validation schema
const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string(),
  technologies: z.array(z.string()).optional().default([]),
  year: z.string().optional(),
  githubLink: z.string().url().optional().nullable(),
  externalLink: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  challenges: z.array(z.string()).optional().default([]),
  outcomes: z.array(z.string()).optional().default([]),
  featured: z.boolean().default(false), // Removed optional as default is provided
  featuredOrder: z.number().optional().nullable(),
  // Add any Firestore specific fields if needed, e.g., createdAt
  // createdAt: z.instanceof(Timestamp).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get query client instance

  // --- Firestore Data Fetching ---
  const fetchProjects = async (): Promise<Project[]> => {
    // Example: Order by title, adjust as needed
    const q = query(projectsCollectionRef, orderBy("title"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...(doc.data() as ProjectSchemaType), // Spread Firestore data
      id: doc.id, // Add Firestore document ID
    }));
  };

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"], // Use Firestore-specific query key
    queryFn: fetchProjects, // Use Firestore fetch function
  });

  // Filter projects based on the active tab
  const filteredProjects = filter === "all" 
    ? projects 
    : filter === "featured" 
      ? projects.filter((p: Project) => p.featured) 
      : projects.filter((p: Project) => p.category === filter);

  const addForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "app_development",
      technologies: [],
      year: new Date().getFullYear().toString(),
      githubLink: "",
      externalLink: "",
      imageUrl: "",
      challenges: [],
      outcomes: [],
      featured: false,
      featuredOrder: null,
    },
  });

  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "app_development",
      technologies: [],
      year: new Date().getFullYear().toString(),
      githubLink: "",
      externalLink: "",
      imageUrl: "",
      challenges: [],
      outcomes: [],
      featured: false,
      featuredOrder: null,
    },
  });

  // Add project mutation
  const addMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Data should already be in the correct format (arrays) due to form changes below
      // Add server timestamp if needed: { ...data, createdAt: serverTimestamp() }
      const docRef = await addDoc(projectsCollectionRef, data);
      return docRef.id; // Return the new document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate Firestore query key
      setIsAdding(false);
      addForm.reset();
      toast({
        title: "Project added",
        description: "The project has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Edit project mutation
  const editMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (!selectedProject?.id) throw new Error("No project selected for editing.");
      
      const projectDocRef = doc(db, "projects", selectedProject.id);
      // Data should already be in the correct format (arrays)
      await updateDoc(projectDocRef, data);
      return selectedProject.id; // Return the updated document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate Firestore query key
      setIsEditing(false);
      setSelectedProject(null);
      editForm.reset();
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { // ID is now string
      if (!id) throw new Error("No project ID provided for deletion.");
      const projectDocRef = doc(db, "projects", id);
      await deleteDoc(projectDocRef);
      return id; // Return the deleted document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate Firestore query key
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmitAdd = (data: ProjectFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: ProjectFormValues) => {
    editMutation.mutate(data);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    
    // Data from Firestore should already have arrays, no JSON parsing needed
    // Ensure arrays are correctly typed as string[] for the form
    const technologies = (Array.isArray(project.technologies) ? project.technologies : []) as string[];
    const challenges = (Array.isArray(project.challenges) ? project.challenges : []) as string[];
    const outcomes = (Array.isArray(project.outcomes) ? project.outcomes : []) as string[];
        
    // Set form values
    editForm.reset({
      title: project.title,
      description: project.description,
      category: project.category,
      technologies,
      year: project.year || new Date().getFullYear().toString(),
      githubLink: project.githubLink || "",
      externalLink: project.externalLink || "",
      imageUrl: project.imageUrl || "",
      challenges,
      outcomes,
      featured: project.featured || false,
      featuredOrder: project.featuredOrder || null,
    });
    
    setIsEditing(true);
  };

  const handleDeleteProject = (project: Project) => {
    if (project.id) { // Ensure ID exists
       deleteMutation.mutate(project.id); // Use string ID
    } else {
      toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </>}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Project</CardTitle>
            <CardDescription>Create a new project in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="app_development">App Development</SelectItem>
                            <SelectItem value="project_management">Project Management</SelectItem>
                            <SelectItem value="web_development">Web Development</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the project..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="technologies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technologies</FormLabel>
                        <FormControl>
                          {/* Use Textarea for easier multi-line/list input */}
                          <Textarea
                            placeholder="React&#10;Node.js&#10;TypeScript"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each technology on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="githubLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="externalLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        URL to a screenshot or logo for this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="challenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenges</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Challenge 1&#10;Challenge 2"
                            className="min-h-[80px]"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each challenge on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="outcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcomes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Outcome 1&#10;Outcome 2"
                            className="min-h-[80px]"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each outcome on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <FormField
                    control={addForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Project</FormLabel>
                          <FormDescription>
                            Featured projects appear in a special section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {addForm.watch("featured") && (
                  <FormField
                    control={addForm.control}
                    name="featuredOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            {...field} 
                            value={field.value === null ? "" : field.value}
                            onChange={e => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which the project appears in the featured section (lower number = higher priority)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isEditing && selectedProject && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
            <CardDescription>Update project details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="app_development">App Development</SelectItem>
                            <SelectItem value="project_management">Project Management</SelectItem>
                            <SelectItem value="web_development">Web Development</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the project..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="technologies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technologies</FormLabel>
                        <FormControl>
                          {/* Use Textarea for easier multi-line/list input */}
                           <Textarea
                            placeholder="React&#10;Node.js&#10;TypeScript"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each technology on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="githubLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="externalLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        URL to a screenshot or logo for this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="challenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenges</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Challenge 1&#10;Challenge 2"
                            className="min-h-[80px]"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each challenge on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="outcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outcomes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Outcome 1&#10;Outcome 2"
                            className="min-h-[80px]"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display as newline separated
                            onChange={e => field.onChange(e.target.value.split("\n").map(t => t.trim()).filter(t => t))} // Store as array
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each outcome on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <FormField
                    control={editForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Project</FormLabel>
                          <FormDescription>
                            Featured projects appear in a special section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {editForm.watch("featured") && (
                  <FormField
                    control={editForm.control}
                    name="featuredOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            {...field} 
                            value={field.value === null ? "" : field.value}
                            onChange={e => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which the project appears in the featured section (lower number = higher priority)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setSelectedProject(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending ? "Updating..." : "Update Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="app_development">App Development</TabsTrigger>
          <TabsTrigger value="project_management">Project Management</TabsTrigger>
          <TabsTrigger value="web_development">Web Development</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No projects found. Add a new project to get started.
          </div>
        ) : (
          filteredProjects.map((project: Project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {project.imageUrl && (
                  <div className="w-full md:w-1/4 min-h-[150px] bg-gray-100">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.title}
                        {project.featured && (
                          <span className="ml-2 inline-flex items-center text-amber-500">
                            <Star className="h-4 w-4" />
                            {project.featuredOrder && (
                              <span className="ml-1 text-sm">{project.featuredOrder}</span>
                            )}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {project.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {project.year && <span> • {project.year}</span>}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this project. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteProject(project)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <p className="text-sm mt-2">{project.description}</p>
                  
                  {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {typeof tech === 'string' ? tech : tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {(project.githubLink || project.externalLink) && (
                    <div className="mt-3 flex space-x-3 text-sm">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          GitHub
                        </a>
                      )}
                      {project.externalLink && (
                        <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Live Project
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}