import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";

// Section form schema
const sectionFormSchema = z.object({
  type: z.string().min(1, "Section type is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional(),
  content: z.string().min(5, "Content is required"),
});

type SectionFormValues = z.infer<typeof sectionFormSchema>;

export default function SectionsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form setup for adding/editing sections
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      type: "",
      title: "",
      subtitle: "",
      content: "",
    },
  });
  
  // Fetch sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ["admin", "sections"],
    queryFn: () => apiRequest("/api/admin/sections"),
  });
  
  // Create section mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/sections", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Section created",
        description: "The section has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section",
        variant: "destructive",
      });
    },
  });
  
  // Update section mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/sections/${currentSection.id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      setIsEditDialogOpen(false);
      setCurrentSection(null);
      toast({
        title: "Section updated",
        description: "The section has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update section",
        variant: "destructive",
      });
    },
  });
  
  // Delete section mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/sections/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: SectionFormValues) => {
    // Parse content as JSON if it's a valid JSON string, otherwise treat as text
    let contentObj;
    try {
      contentObj = JSON.parse(data.content);
    } catch (e) {
      contentObj = { text: data.content };
    }
    
    const processedData = {
      ...data,
      content: contentObj,
    };
    
    if (currentSection) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };
  
  // Get badge variant based on section type
  const getSectionTypeVariant = (type: string) => {
    switch (type) {
      case "hero":
        return "default";
      case "about":
        return "secondary";
      case "professionalProject":
        return "destructive";
      case "personalProject":
        return "outline";
      case "experience":
        return "default";
      case "contact":
        return "secondary";
      default:
        return "outline";
    }
  };
  
  // Format content for display
  const formatContent = (content: any) => {
    if (typeof content === "string") {
      return content;
    }
    
    if (content && typeof content === "object") {
      return JSON.stringify(content, null, 2);
    }
    
    return String(content);
  };
  
  // Handle edit button click
  const handleEdit = (section: any) => {
    setCurrentSection(section);
    
    // Format data for the form
    form.reset({
      type: section.type,
      title: section.title,
      subtitle: section.subtitle || "",
      content: formatContent(section.content),
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (id: number) => {
    setSectionToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const confirmDelete = () => {
    if (sectionToDelete !== null) {
      deleteMutation.mutate(sectionToDelete);
    }
  };
  
  // Reset form when opening add dialog
  const handleAddClick = () => {
    form.reset({
      type: "hero",
      title: "",
      subtitle: "",
      content: "",
    });
    setIsAddDialogOpen(true);
  };
  
  if (isLoading) {
    return <div className="py-10 text-center">Loading sections...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Content Sections</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>
      
      {sections && sections.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section: any) => (
              <TableRow key={section.id}>
                <TableCell>
                  <Badge variant={getSectionTypeVariant(section.type)}>
                    {section.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{section.title}</TableCell>
                <TableCell>
                  {new Date(section.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(section)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Sections</CardTitle>
            <CardDescription>
              There are no content sections yet. Add your first section to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Content Section</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Section Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Section Subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (JSON or Text)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"key": "value"} or plain text content' 
                        className="min-h-[200px] font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Section"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Section</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Section Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Section Subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (JSON or Text)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"key": "value"} or plain text content' 
                        className="min-h-[200px] font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Section"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this content section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}