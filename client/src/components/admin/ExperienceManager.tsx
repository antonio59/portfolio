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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Experience } from "@shared/schema";

// Experience form schema
const experienceSchema = z.object({
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().min(1, "Description is required"),
  order: z.coerce.number().optional()
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all experiences
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["/api/admin/experiences"],
  });

  // Form setup for adding experiences
  const addForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      role: "",
      company: "",
      period: "",
      description: "",
      order: 0
    }
  });

  // Form setup for editing experiences
  const editForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      role: "",
      company: "",
      period: "",
      description: "",
      order: 0
    }
  });

  // Experience creation mutation
  const createExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      const response = await apiRequest("POST", "/api/admin/experiences", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create experience.",
        variant: "destructive",
      });
    },
  });

  // Experience update mutation
  const updateExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/admin/experiences/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      setIsEditDialogOpen(false);
      setSelectedExperience(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update experience.",
        variant: "destructive",
      });
    },
  });

  // Experience deletion mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/experiences/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      setIsDeleteDialogOpen(false);
      setSelectedExperience(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience.",
        variant: "destructive",
      });
    },
  });

  // Handle experience creation form submission
  const onSubmitAdd = (data: ExperienceFormValues) => {
    createExperienceMutation.mutate(data);
  };

  // Handle experience update form submission
  const onSubmitEdit = (data: ExperienceFormValues) => {
    if (selectedExperience) {
      updateExperienceMutation.mutate({
        id: selectedExperience.id,
        ...data,
      });
    }
  };

  // Open edit dialog and populate form with selected experience
  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    
    editForm.reset({
      role: experience.role,
      company: experience.company,
      period: experience.period,
      description: experience.description,
      order: experience.order || 0
    });
    
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDeleteDialogOpen(true);
  };

  // Confirm experience deletion
  const confirmDeleteExperience = () => {
    if (selectedExperience) {
      deleteExperienceMutation.mutate(selectedExperience.id);
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
        <h2 className="text-2xl font-bold">Work Experience</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No experiences found. Add your first experience to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiences.map((experience: Experience) => (
                  <TableRow key={experience.id}>
                    <TableCell className="font-medium">{experience.role}</TableCell>
                    <TableCell>{experience.company}</TableCell>
                    <TableCell>{experience.period}</TableCell>
                    <TableCell>{experience.order || 0}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditExperience(experience)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteExperience(experience)}>
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

      {/* Add Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role/Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Project Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan 2020 - Present" {...field} />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your responsibilities and achievements..." 
                        className="min-h-[150px]" 
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
                  disabled={createExperienceMutation.isPending}
                >
                  {createExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Experience"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role/Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Project Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan 2020 - Present" {...field} />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your responsibilities and achievements..." 
                        className="min-h-[150px]" 
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
                  disabled={updateExperienceMutation.isPending}
                >
                  {updateExperienceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Experience"
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
            Are you sure you want to delete the experience "{selectedExperience?.role} at {selectedExperience?.company}"? This action cannot be undone.
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
              onClick={confirmDeleteExperience}
              disabled={deleteExperienceMutation.isPending}
            >
              {deleteExperienceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Experience"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}