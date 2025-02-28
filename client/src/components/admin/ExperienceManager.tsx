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
import { Edit, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";

// Experience form schema
const experienceFormSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  period: z.string().min(2, "Period must be at least 2 characters"),
  description: z.string().min(10, "Description must include at least one item"),
  achievements: z.string().min(10, "Achievements must include at least one item"),
  methodologies: z.string().min(3, "Methodologies must include at least one item"),
  order: z.number().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export default function ExperienceManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form setup for adding/editing experiences
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: "",
      role: "",
      period: "",
      description: "",
      achievements: "",
      methodologies: "",
      order: 0,
    },
  });
  
  // Fetch experiences
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["admin", "experiences"],
    queryFn: () => apiRequest("/api/admin/experiences"),
  });
  
  // Create experience mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/experiences", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "experiences"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Experience created",
        description: "The experience has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create experience",
        variant: "destructive",
      });
    },
  });
  
  // Update experience mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/experiences/${currentExperience.id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "experiences"] });
      setIsEditDialogOpen(false);
      setCurrentExperience(null);
      toast({
        title: "Experience updated",
        description: "The experience has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update experience",
        variant: "destructive",
      });
    },
  });
  
  // Delete experience mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/experiences/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "experiences"] });
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
      toast({
        title: "Experience deleted",
        description: "The experience has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience",
        variant: "destructive",
      });
    },
  });
  
  // Move experience order mutation
  const moveOrderMutation = useMutation({
    mutationFn: ({ id, order }: { id: number, order: number }) => 
      apiRequest(`/api/admin/experiences/${id}`, {
        method: "PUT",
        body: JSON.stringify({ order })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "experiences"] });
      toast({
        title: "Order updated",
        description: "The experience order has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ExperienceFormValues) => {
    // Process text areas into arrays
    const processedData = {
      ...data,
      description: data.description.split("\n").filter(Boolean),
      achievements: data.achievements.split("\n").filter(Boolean),
      methodologies: data.methodologies.split(",").map(item => item.trim()).filter(Boolean),
    };
    
    if (currentExperience) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };
  
  // Handle move up/down to reorder experiences
  const handleMove = (experience: any, direction: 'up' | 'down') => {
    if (!experiences) return;
    
    const sortedExperiences = [...experiences].sort((a: any, b: any) => a.order - b.order);
    const currentIndex = sortedExperiences.findIndex((e: any) => e.id === experience.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const prevExperience = sortedExperiences[currentIndex - 1];
      moveOrderMutation.mutate({ id: experience.id, order: prevExperience.order });
      moveOrderMutation.mutate({ id: prevExperience.id, order: experience.order });
    } else if (direction === 'down' && currentIndex < sortedExperiences.length - 1) {
      const nextExperience = sortedExperiences[currentIndex + 1];
      moveOrderMutation.mutate({ id: experience.id, order: nextExperience.order });
      moveOrderMutation.mutate({ id: nextExperience.id, order: experience.order });
    }
  };
  
  // Handle edit button click
  const handleEdit = (experience: any) => {
    setCurrentExperience(experience);
    
    // Format data for the form
    form.reset({
      company: experience.company,
      role: experience.role,
      period: experience.period,
      description: Array.isArray(experience.description) 
        ? experience.description.join("\n") 
        : "",
      achievements: Array.isArray(experience.achievements) 
        ? experience.achievements.join("\n") 
        : "",
      methodologies: Array.isArray(experience.methodologies) 
        ? experience.methodologies.join(", ") 
        : "",
      order: experience.order,
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (id: number) => {
    setExperienceToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const confirmDelete = () => {
    if (experienceToDelete !== null) {
      deleteMutation.mutate(experienceToDelete);
    }
  };
  
  // Reset form when opening add dialog
  const handleAddClick = () => {
    form.reset({
      company: "",
      role: "",
      period: "",
      description: "",
      achievements: "",
      methodologies: "",
      order: experiences ? experiences.length : 0,
    });
    setIsAddDialogOpen(true);
  };
  
  if (isLoading) {
    return <div className="py-10 text-center">Loading experiences...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Work Experience</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>
      
      {experiences && experiences.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...experiences]
              .sort((a: any, b: any) => a.order - b.order)
              .map((experience: any) => (
                <TableRow key={experience.id}>
                  <TableCell>{experience.order}</TableCell>
                  <TableCell className="font-medium">{experience.company}</TableCell>
                  <TableCell>{experience.role}</TableCell>
                  <TableCell>{experience.period}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMove(experience, 'up')}
                      disabled={experience.order === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMove(experience, 'down')}
                      disabled={experience.order === experiences.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(experience)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(experience.id)}>
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
            <CardTitle>No Experience Entries</CardTitle>
            <CardDescription>
              There are no work experience entries yet. Add your first experience to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {/* Add Experience Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Work Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <Input placeholder="2020 - Present" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities (One per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Responsibility 1&#10;Responsibility 2" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievements (One per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Achievement 1&#10;Achievement 2" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="methodologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodologies & Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Agile, PRINCE2, Scrum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Experience"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <Input placeholder="2020 - Present" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities (One per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Responsibility 1&#10;Responsibility 2" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievements (One per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Achievement 1&#10;Achievement 2" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="methodologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodologies & Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Agile, PRINCE2, Scrum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Experience"}
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
              This action cannot be undone. This will permanently delete this experience entry.
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