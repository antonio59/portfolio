import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Section } from "@shared/schema";

// Section form schema
const sectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  type: z.string().min(1, "Type is required"),
  order: z.coerce.number().optional()
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function SectionsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all sections
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["/api/admin/sections"],
  });

  // Form setup for adding sections
  const addForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
      type: "about",
      order: 0
    }
  });

  // Form setup for editing sections
  const editForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
      type: "about",
      order: 0
    }
  });

  // Section creation mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: SectionFormValues) => {
      // Convert content from string to array or appropriate format for storage
      const transformedData = {
        ...data,
        content: data.content.split("\n\n").filter(p => p.trim().length > 0)
      };
      
      const response = await apiRequest("POST", "/api/admin/sections", transformedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Section has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section.",
        variant: "destructive",
      });
    },
  });

  // Section update mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: SectionFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      
      // Convert content from string to array for storage
      const transformedData = {
        ...updateData,
        content: updateData.content.split("\n\n").filter(p => p.trim().length > 0)
      };
      
      const response = await apiRequest("PUT", `/api/admin/sections/${id}`, transformedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Section has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsEditDialogOpen(false);
      setSelectedSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update section.",
        variant: "destructive",
      });
    },
  });

  // Section deletion mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/sections/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Section has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsDeleteDialogOpen(false);
      setSelectedSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section.",
        variant: "destructive",
      });
    },
  });

  // Handle section creation form submission
  const onSubmitAdd = (data: SectionFormValues) => {
    createSectionMutation.mutate(data);
  };

  // Handle section update form submission
  const onSubmitEdit = (data: SectionFormValues) => {
    if (selectedSection) {
      updateSectionMutation.mutate({
        id: selectedSection.id,
        ...data,
      });
    }
  };

  // Open edit dialog and populate form with selected section
  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    
    // Handle different data structures for content
    let contentText = "";
    if (Array.isArray(section.content)) {
      contentText = section.content.join("\n\n");
    } else if (typeof section.content === 'string') {
      contentText = section.content;
    } else if (section.content) {
      // Try to convert other structures to string
      try {
        contentText = JSON.stringify(section.content, null, 2);
      } catch (e) {
        contentText = String(section.content);
      }
    }
    
    editForm.reset({
      title: section.title,
      subtitle: section.subtitle || "",
      content: contentText,
      type: section.type,
      order: (section as any).order || 0 // Use type assertion as a temporary fix
    });
    
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteSection = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteDialogOpen(true);
  };

  // Confirm section deletion
  const confirmDeleteSection = () => {
    if (selectedSection) {
      deleteSectionMutation.mutate(selectedSection.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Sections</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No sections found. Add your first section to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section: Section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.title}</TableCell>
                    <TableCell>{section.type}</TableCell>
                    <TableCell>{section.order || 0}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSection(section)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSection(section)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="About Me" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="skills">Skills</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A brief introduction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Section content..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSectionMutation.isPending}
                >
                  {createSectionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Section"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="About Me" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
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
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="skills">Skills</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A brief introduction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Section content..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
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
                  {updateSectionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Section"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <p className="py-4">
            Are you sure you want to delete the section "{selectedSection?.title}"? This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDeleteSection}
              disabled={deleteSectionMutation.isPending}
            >
              {deleteSectionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Section"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}