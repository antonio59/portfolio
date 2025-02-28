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
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { insertExperienceSchema } from "@shared/schema";

// Extended experience form schema with validation
const experienceFormSchema = insertExperienceSchema.extend({
  description: z.string().min(1, "Description is required").transform(val => 
    JSON.parse(val) as string[]
  ),
  achievements: z.string().min(1, "Achievements are required").transform(val => 
    JSON.parse(val) as string[]
  ),
  methodologies: z.string().min(1, "Methodologies are required").transform(val => 
    JSON.parse(val) as string[]
  ),
  order: z.number().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export default function ExperienceManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch experiences data
  const { data: experiences, isLoading, error } = useQuery({
    queryKey: ["/api/admin/experiences"],
    queryFn: () => apiRequest("/api/admin/experiences"),
  });
  
  // Add experience form
  const addForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: "",
      role: "",
      period: "",
      description: "[]",
      achievements: "[]",
      methodologies: "[]",
    },
  });
  
  // Edit experience form
  const editForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: "",
      role: "",
      period: "",
      description: "[]",
      achievements: "[]",
      methodologies: "[]",
    },
  });
  
  // Prepare experience data for form editing
  const prepareExperienceForEdit = (experience: any) => {
    setSelectedExperience(experience);
    
    // Format data for the form
    editForm.reset({
      company: experience.company,
      role: experience.role,
      period: experience.period,
      description: JSON.stringify(experience.description),
      achievements: JSON.stringify(experience.achievements),
      methodologies: JSON.stringify(experience.methodologies),
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Mutations
  const addExperienceMutation = useMutation({
    mutationFn: (data: ExperienceFormValues) => {
      return apiRequest("/api/admin/experiences", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Experience added",
        description: "The experience has been added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add experience",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  const updateExperienceMutation = useMutation({
    mutationFn: (data: ExperienceFormValues & { id: number }) => {
      const { id, ...experienceData } = data;
      return apiRequest(`/api/admin/experiences/${id}`, {
        method: "PUT",
        body: JSON.stringify(experienceData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Experience updated",
        description: "The experience has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedExperience(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update experience",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/admin/experiences/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Experience deleted",
        description: "The experience has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete experience",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submissions
  const onSubmit = (data: ExperienceFormValues) => {
    if (selectedExperience) {
      updateExperienceMutation.mutate({
        ...data,
        id: selectedExperience.id,
      });
    } else {
      addExperienceMutation.mutate(data);
    }
  };
  
  if (isLoading) return <div>Loading experiences...</div>;
  if (error) return <div>Error loading experiences: {(error as Error).message}</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experience Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Experience</DialogTitle>
              <DialogDescription>
                Create a new work experience for your portfolio.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Your position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='["Managed cross-functional teams", "Led product initiatives"]' 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter as JSON array of strings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='["Increased revenue by 30%", "Reduced costs by 20%"]' 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter as JSON array of strings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="methodologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Methodologies/Skills</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='["Agile", "Scrum", "JIRA", "Project Management"]' 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter as JSON array of strings
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
                    disabled={addExperienceMutation.isPending}
                  >
                    {addExperienceMutation.isPending ? "Adding..." : "Add Experience"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Experience listing */}
      <div className="space-y-4">
        {experiences && experiences.length > 0 ? (
          experiences.map((experience: any) => (
            <Card key={experience.id}>
              <CardHeader>
                <CardTitle className="text-lg">{experience.company}</CardTitle>
                <CardDescription className="flex justify-between">
                  <span>{experience.role}</span>
                  <span>{experience.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {experience.description.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Achievements:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {experience.achievements.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Skills & Methodologies:</h4>
                    <div className="flex flex-wrap gap-1">
                      {experience.methodologies.map((item: string, index: number) => (
                        <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => prepareExperienceForEdit(experience)}
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
                      <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this experience at {experience.company}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteExperienceMutation.mutate(experience.id)}
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
          <div className="text-center py-8">
            <p className="text-gray-500">No experiences found. Add your first experience!</p>
          </div>
        )}
      </div>
      
      {/* Edit Experience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>
              Update experience information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Your position" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='["Managed cross-functional teams", "Led product initiatives"]' 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter as JSON array of strings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achievements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='["Increased revenue by 30%", "Reduced costs by 20%"]' 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter as JSON array of strings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="methodologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodologies/Skills</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='["Agile", "Scrum", "JIRA", "Project Management"]' 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter as JSON array of strings
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
                  disabled={updateExperienceMutation.isPending}
                >
                  {updateExperienceMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}