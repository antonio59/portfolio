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
  // Timestamp // Keep if needed for date fields later
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react"; // Removed MoveUp, MoveDown
import type { Experience as ExperienceSchemaType } from "@shared/schema";

// Define Firestore Experience type including string ID
interface Experience extends Omit<ExperienceSchemaType, 'id'> {
  id: string; // Firestore uses string IDs
}

// Define Firestore collection reference
const experiencesCollectionRef = collection(db, "experiences");

// Form validation schema
const experienceSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  period: z.string(),
  description: z.array(z.string()).min(1, "At least one description point is required"),
  achievements: z.array(z.string()).optional().default([]),
  methodologies: z.array(z.string()).optional().default([]),
  order: z.number().int().default(1), // Removed optional
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get query client instance

  // --- Firestore Data Fetching ---
  const fetchExperiences = async (): Promise<Experience[]> => {
    const q = query(experiencesCollectionRef, orderBy("order", "asc")); // Order by 'order' field
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...(doc.data() as ExperienceSchemaType), // Spread Firestore data
      id: doc.id, // Add Firestore document ID
    }));
  };

  const { data: experiences = [], isLoading } = useQuery<Experience[]>({
    queryKey: ["experiences"], // Use Firestore-specific query key
    queryFn: fetchExperiences, // Use Firestore fetch function
  });

  const addForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      role: "",
      period: "",
      description: [""],
      achievements: [],
      methodologies: [],
      order: 1,
    },
  });

  const editForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      role: "",
      period: "",
      description: [""],
      achievements: [],
      methodologies: [],
      order: 1,
    },
  });

  // Add experience mutation
  const addMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      // Data should already be in the correct format (arrays)
      // Ensure order is a number
      const dataToSave = {
        ...data,
        order: Number(data.order) || 1,
      };
      const docRef = await addDoc(experiencesCollectionRef, dataToSave);
      return docRef.id; // Return the new document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Invalidate Firestore query key
      setIsAdding(false);
      addForm.reset({
        company: "",
        role: "",
        period: "",
        description: [""],
        achievements: [],
        methodologies: [],
        order: 1,
      });
      toast({
        title: "Experience added",
        description: "The experience has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding experience",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Edit experience mutation
  const editMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      if (!selectedExperience?.id) throw new Error("No experience selected for editing.");
      
      const experienceDocRef = doc(db, "experiences", selectedExperience.id);
      // Data should already be in the correct format (arrays)
      // Ensure order is a number
      const dataToSave = {
        ...data,
        order: Number(data.order) || 1,
      };
      await updateDoc(experienceDocRef, dataToSave);
      return selectedExperience.id; // Return the updated document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Invalidate Firestore query key
      setIsEditing(false);
      setSelectedExperience(null);
      editForm.reset();
      toast({
        title: "Experience updated",
        description: "The experience has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating experience",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete experience mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { // ID is now string
      if (!id) throw new Error("No experience ID provided for deletion.");
      const experienceDocRef = doc(db, "experiences", id);
      await deleteDoc(experienceDocRef);
      return id; // Return the deleted document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] }); // Invalidate Firestore query key
      toast({
        title: "Experience deleted",
        description: "The experience has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting experience",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Removed reorderMutation as Firestore reordering is complex and handled via 'order' field

  const onSubmitAdd = (data: ExperienceFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: ExperienceFormValues) => {
    editMutation.mutate(data);
  };

  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    
    // Data from Firestore should already have arrays
    const description = (Array.isArray(experience.description) ? experience.description : []) as string[];
    const achievements = (Array.isArray(experience.achievements) ? experience.achievements : []) as string[];
    const methodologies = (Array.isArray(experience.methodologies) ? experience.methodologies : []) as string[];
    
    // Set form values
    editForm.reset({
      company: experience.company,
      role: experience.role,
      period: experience.period,
      description,
      achievements,
      methodologies,
      order: experience.order || 1,
    });
    
    setIsEditing(true);
  };

  const handleDeleteExperience = (experience: Experience) => {
    if (experience.id) { // Ensure ID exists
      deleteMutation.mutate(experience.id); // Use string ID
    } else {
      toast({ title: "Error", description: "Experience ID is missing.", variant: "destructive" });
    }
  };
  
  // Removed handleMoveExperience function

  // Helper function to add a new description field
  const addDescriptionField = (formHook: any) => {
    const currentDescriptions = formHook.getValues("description") || [];
    formHook.setValue("description", [...currentDescriptions, ""]);
  };

  // Helper function to remove a description field
  const removeDescriptionField = (formHook: any, index: number) => {
    const currentDescriptions = formHook.getValues("description") || [];
    if (currentDescriptions.length <= 1) return; // Don't remove the last one
    
    formHook.setValue(
      "description", 
      currentDescriptions.filter((_: any, i: number) => i !== index)
    );
  };

  if (isLoading) {
    return <div>Loading experiences...</div>;
  }

  // Sort experiences by order
  const sortedExperiences = [...experiences].sort((a: Experience, b: Experience) => {
    return (a.order || 999) - (b.order || 999);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Experience Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <>
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </>}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Experience</CardTitle>
            <CardDescription>Create a new work or project experience entry</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Organization</FormLabel>
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
                        <FormLabel>Role / Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Your job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="Jan 2023 - Present" {...field} />
                        </FormControl>
                        <FormDescription>
                          Time period of employment or engagement
                        </FormDescription>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which experience appears (lower number = higher position)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Description Points</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addDescriptionField(addForm)}
                    >
                      Add Point
                    </Button>
                  </div>
                  
                  {addForm.watch("description")?.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <FormField
                        control={addForm.control}
                        name={`description.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Description point ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeDescriptionField(addForm, index)}
                        disabled={addForm.watch("description")?.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <FormField
                  control={addForm.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Achievements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Achievement 1&#10;Achievement 2"
                          className="min-h-[80px]"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display newline separated
                          onChange={e => field.onChange(e.target.value.split("\n").map(a => a.trim()).filter(a => a))} // Store as array
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each achievement on a new line
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
                      <FormLabel>Methodologies & Tools</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Agile&#10;Scrum&#10;Jira"
                          className="min-h-[80px]"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display newline separated
                          onChange={e => field.onChange(e.target.value.split("\n").map(m => m.trim()).filter(m => m))} // Store as array
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each methodology/tool on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Experience"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isEditing && selectedExperience && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Experience</CardTitle>
            <CardDescription>Update experience details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Organization</FormLabel>
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
                        <FormLabel>Role / Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Your job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="Jan 2023 - Present" {...field} />
                        </FormControl>
                        <FormDescription>
                          Time period of employment or engagement
                        </FormDescription>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which experience appears (lower number = higher position)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Description Points</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addDescriptionField(editForm)}
                    >
                      Add Point
                    </Button>
                  </div>
                  
                  {editForm.watch("description")?.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <FormField
                        control={editForm.control}
                        name={`description.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Description point ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeDescriptionField(editForm, index)}
                        disabled={editForm.watch("description")?.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <FormField
                  control={editForm.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Achievements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Achievement 1&#10;Achievement 2"
                          className="min-h-[80px]"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display newline separated
                          onChange={e => field.onChange(e.target.value.split("\n").map(a => a.trim()).filter(a => a))} // Store as array
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each achievement on a new line
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
                      <FormLabel>Methodologies & Tools</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Agile&#10;Scrum&#10;Jira"
                          className="min-h-[80px]"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""} // Display newline separated
                          onChange={e => field.onChange(e.target.value.split("\n").map(m => m.trim()).filter(m => m))} // Store as array
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each methodology/tool on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setSelectedExperience(null);
                    editForm.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Display Experiences */}
      <div className="space-y-4">
        {sortedExperiences.length === 0 ? (
          <p className="text-center text-gray-500">No experiences added yet.</p>
        ) : (
          sortedExperiences.map((experience: Experience, index: number) => (
            <Card key={experience.id} className="overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-start bg-gray-50 p-4">
                <div>
                  <CardTitle className="text-lg">{experience.role}</CardTitle>
                  <CardDescription>{experience.company} ({experience.period}) - Order: {experience.order}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  {/* Reorder buttons removed */}
                  <Button variant="ghost" size="sm" onClick={() => handleEditExperience(experience)}>
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
                        <AlertDialogTitle>Delete Experience?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the experience entry for "{experience.role}" at "{experience.company}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteExperience(experience)}
                          className="bg-red-600 hover:bg-red-700" // Destructive style
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                <div className="mt-2">
                  <h5 className="text-sm font-semibold mb-1">Description</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    {/* Ensure description is an array before mapping */}
                    {Array.isArray(experience.description) 
                      ? experience.description.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))
                      : <li>No description points available.</li> /* Handle case if not an array */
                    }
                  </ul>
                </div>
                
                {(Array.isArray(experience.achievements) && experience.achievements.length > 0) && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold mb-1">Key Achievements</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                      {experience.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(Array.isArray(experience.methodologies) && experience.methodologies.length > 0) && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold mb-1">Methodologies & Tools</h5>
                    <div className="flex flex-wrap gap-1">
                      {experience.methodologies.map((methodology, i) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {methodology}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}