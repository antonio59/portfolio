import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { insertSectionSchema } from "@shared/schema";

// Extended section form schema with validation
const sectionFormSchema = insertSectionSchema.extend({
  content: z.string().min(1, "Content is required").transform(val => 
    JSON.parse(val)
  ),
});

type SectionFormValues = z.infer<typeof sectionFormSchema>;

export default function SectionsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch sections data
  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["/api/admin/sections"],
    queryFn: () => apiRequest("/api/admin/sections"),
  });
  
  // Add section form
  const addForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      type: "hero",
      title: "",
      subtitle: "",
      content: "{}",
    },
  });
  
  // Edit section form
  const editForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      type: "hero",
      title: "",
      subtitle: "",
      content: "{}",
    },
  });
  
  // Prepare section data for form editing
  const prepareSectionForEdit = (section: any) => {
    setSelectedSection(section);
    
    // Format data for the form
    editForm.reset({
      type: section.type,
      title: section.title,
      subtitle: section.subtitle || "",
      content: JSON.stringify(section.content),
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Get section type badge color
  const getSectionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hero: "bg-blue-100 text-blue-800",
      about: "bg-green-100 text-green-800",
      professionalProject: "bg-purple-100 text-purple-800",
      personalProject: "bg-indigo-100 text-indigo-800",
      experience: "bg-orange-100 text-orange-800",
      contact: "bg-red-100 text-red-800",
    };
    
    return colors[type] || "bg-gray-100 text-gray-800";
  };
  
  // Get human-readable section type label
  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hero: "Hero",
      about: "About",
      professionalProject: "Professional Project",
      personalProject: "Personal Project",
      experience: "Experience",
      contact: "Contact",
    };
    
    return labels[type] || type;
  };
  
  // Mutations
  const addSectionMutation = useMutation({
    mutationFn: (data: SectionFormValues) => {
      return apiRequest("/api/admin/sections", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({
        title: "Section added",
        description: "The section has been added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add section",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  const updateSectionMutation = useMutation({
    mutationFn: (data: SectionFormValues & { id: number }) => {
      const { id, ...sectionData } = data;
      return apiRequest(`/api/admin/sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(sectionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({
        title: "Section updated",
        description: "The section has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update section",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/sections/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete section",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submissions
  const onSubmitAdd = (data: SectionFormValues) => {
    addSectionMutation.mutate(data);
  };
  
  const onSubmitEdit = (data: SectionFormValues) => {
    if (selectedSection) {
      updateSectionMutation.mutate({
        ...data,
        id: selectedSection.id,
      });
    }
  };
  
  if (isLoading) return <div>Loading sections...</div>;
  if (error) return <div>Error loading sections: {(error as Error).message}</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Sections Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>
                Create a new content section for your portfolio.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="professionalProject">Professional Project</SelectItem>
                          <SelectItem value="personalProject">Personal Project</SelectItem>
                          <SelectItem value="experience">Experience</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Section subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"key": "value", "items": ["item1", "item2"]}' 
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter as a valid JSON object with the section's content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addSectionMutation.isPending}
                  >
                    {addSectionMutation.isPending ? "Adding..." : "Add Section"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Section listing */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {sections && sections.length > 0 ? (
          sections.map((section: any) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    {section.subtitle && (
                      <CardDescription className="mt-1">{section.subtitle}</CardDescription>
                    )}
                  </div>
                  <Badge className={getSectionTypeColor(section.type)}>
                    {getSectionTypeLabel(section.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-auto">
                  <code className="text-xs font-mono break-all whitespace-pre-wrap">
                    {JSON.stringify(section.content, null, 2)}
                  </code>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => prepareSectionForEdit(section)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Section</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the "{section.title}" section? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteSectionMutation.mutate(section.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No sections found. Add your first content section!</p>
          </div>
        )}
      </div>
      
      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="about">About</SelectItem>
                        <SelectItem value="professionalProject">Professional Project</SelectItem>
                        <SelectItem value="personalProject">Personal Project</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Section title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Section subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"key": "value", "items": ["item1", "item2"]}' 
                        rows={8}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter as a valid JSON object with the section's content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSectionMutation.isPending}
                >
                  {updateSectionMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}