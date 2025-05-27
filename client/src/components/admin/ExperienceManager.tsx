import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, MoveUp, MoveDown } from "lucide-react";
import type { Experience } from "@shared/schema";

// Form validation schema
const experienceSchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  period: z.string(),
  description: z
    .array(z.string())
    .min(1, "At least one description point is required"),
  achievements: z.array(z.string()).optional().default([]),
  methodologies: z.array(z.string()).optional().default([]),
  order: z.number().int().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const { toast } = useToast();

  // Fetch experiences
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["/api/admin/experiences"],
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
      // Ensure arrays are properly formatted
      const formattedData = {
        ...data,
        description: Array.isArray(data.description)
          ? data.description
          : [data.description as unknown as string],
        achievements:
          typeof data.achievements === "string"
            ? data.achievements.split(",").map((a) => a.trim())
            : data.achievements,
        methodologies:
          typeof data.methodologies === "string"
            ? data.methodologies.split(",").map((m) => m.trim())
            : data.methodologies,
      };

      const response = await apiRequest(
        "POST",
        "/api/admin/experiences",
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
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
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Edit experience mutation
  const editMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      if (!selectedExperience) return null;

      // Ensure arrays are properly formatted
      const formattedData = {
        ...data,
        description: Array.isArray(data.description)
          ? data.description
          : [data.description as unknown as string],
        achievements:
          typeof data.achievements === "string"
            ? data.achievements.split(",").map((a) => a.trim())
            : data.achievements,
        methodologies:
          typeof data.methodologies === "string"
            ? data.methodologies.split(",").map((m) => m.trim())
            : data.methodologies,
      };

      const response = await apiRequest(
        "PUT",
        `/api/admin/experiences/${selectedExperience.id}`,
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
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
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete experience mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/experiences/${id}`,
      );
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Experience deleted",
        description: "The experience has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting experience",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Reorder experience mutation (move up or down)
  const reorderMutation = useMutation({
    mutationFn: async ({
      id,
      direction,
    }: {
      id: number;
      direction: "up" | "down";
    }) => {
      const response = await apiRequest(
        "PUT",
        `/api/admin/experiences/${id}/reorder`,
        { direction },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiences"] });
      toast({
        title: "Experience reordered",
        description: "The experience order has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error reordering experience",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmitAdd = (data: ExperienceFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: ExperienceFormValues) => {
    editMutation.mutate(data);
  };

  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);

    // Parse JSON strings if needed
    const description = Array.isArray(experience.description)
      ? experience.description
      : typeof experience.description === "string"
        ? JSON.parse(experience.description)
        : [experience.description];

    const achievements = Array.isArray(experience.achievements)
      ? experience.achievements
      : experience.achievements
        ? JSON.parse(experience.achievements)
        : [];

    const methodologies = Array.isArray(experience.methodologies)
      ? experience.methodologies
      : experience.methodologies
        ? JSON.parse(experience.methodologies)
        : [];

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
    deleteMutation.mutate(experience.id);
  };

  const handleMoveExperience = (
    experience: Experience,
    direction: "up" | "down",
  ) => {
    reorderMutation.mutate({ id: experience.id, direction });
  };

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
      currentDescriptions.filter((_: any, i: number) => i !== index),
    );
  };

  if (isLoading) {
    return <div>Loading experiences...</div>;
  }

  // Sort experiences by order
  const sortedExperiences = [...experiences].sort(
    (a: Experience, b: Experience) => {
      return (a.order || 999) - (b.order || 999);
    },
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Experience Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Experience</CardTitle>
            <CardDescription>
              Create a new work or project experience entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onSubmitAdd)}
                className="space-y-4"
              >
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
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which experience appears (lower number =
                          higher position)
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
                              <Input
                                placeholder={`Description point ${index + 1}`}
                                {...field}
                              />
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
                          placeholder="Achievement 1, Achievement 2, etc. (comma separated)"
                          className="min-h-[80px]"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((a) => a.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter key achievements separated by commas
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
                          placeholder="Agile, Scrum, Kanban, etc. (comma separated)"
                          className="min-h-[80px]"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((m) => m.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter methodologies and tools separated by commas
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
              <form
                onSubmit={editForm.handleSubmit(onSubmitEdit)}
                className="space-y-4"
              >
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
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Order in which experience appears (lower number =
                          higher position)
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
                              <Input
                                placeholder={`Description point ${index + 1}`}
                                {...field}
                              />
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
                          placeholder="Achievement 1, Achievement 2, etc. (comma separated)"
                          className="min-h-[80px]"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((a) => a.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter key achievements separated by commas
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
                          placeholder="Agile, Scrum, Kanban, etc. (comma separated)"
                          className="min-h-[80px]"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((m) => m.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter methodologies and tools separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedExperience(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending
                      ? "Updating..."
                      : "Update Experience"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sortedExperiences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No experiences found. Add a new experience to get started.
          </div>
        ) : (
          sortedExperiences.map((experience: Experience) => (
            <Card key={experience.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">
                        {experience.role}
                      </h3>
                      <span className="text-sm ml-2 text-gray-500">at</span>
                      <h4 className="text-lg ml-2">{experience.company}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {experience.period}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveExperience(experience, "up")}
                      disabled={experience.order === 1}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveExperience(experience, "down")}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExperience(experience)}
                    >
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
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this experience. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteExperience(experience)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-semibold mb-2">Description</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                    {Array.isArray(experience.description) ? (
                      experience.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))
                    ) : (
                      <li>{experience.description}</li>
                    )}
                  </ul>
                </div>

                {Array.isArray(experience.achievements) &&
                  experience.achievements.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold mb-2">
                        Key Achievements
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                        {experience.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(experience.methodologies) &&
                  experience.methodologies.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold mb-2">
                        Methodologies & Tools
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {experience.methodologies.map((methodology, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {methodology}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
