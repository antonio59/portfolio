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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Section } from "@shared/schema";

// Form validation schema
const sectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional().nullable(),
  content: z
    .array(z.string())
    .min(1, "At least one content paragraph is required"),
  type: z.enum([
    "hero",
    "about",
    "professionalProject",
    "personalProject",
    "experience",
    "contact",
    "certification",
    "featuredProject",
  ]),
  displayOrder: z.number().int().optional(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

const sectionTypeLabels: Record<string, string> = {
  hero: "Hero Section",
  about: "About Me",
  professionalProject: "Professional Projects",
  personalProject: "Personal Projects",
  experience: "Experience",
  contact: "Contact",
  certification: "Certifications",
  featuredProject: "Featured Projects",
};

export default function SectionsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  // Fetch sections
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["/api/admin/sections"],
  });

  // Filter sections based on the active tab
  const filteredSections =
    filter === "all"
      ? sections
      : sections.filter((s: Section) => s.type === filter);

  const addForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: [""],
      type: "about",
      displayOrder: 1,
    },
  });

  const editForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: [""],
      type: "about",
      displayOrder: 1,
    },
  });

  // Add section mutation
  const addMutation = useMutation({
    mutationFn: async (data: SectionFormValues) => {
      // Ensure content is always an array
      const formattedData = {
        ...data,
        content: Array.isArray(data.content)
          ? data.content
          : [data.content as unknown as string],
      };

      const response = await apiRequest(
        "POST",
        "/api/admin/sections",
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsAdding(false);
      addForm.reset({
        title: "",
        subtitle: "",
        content: [""],
        type: "about",
        displayOrder: 1,
      });
      toast({
        title: "Section added",
        description: "The section has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding section",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Edit section mutation
  const editMutation = useMutation({
    mutationFn: async (data: SectionFormValues) => {
      if (!selectedSection) return null;

      // Ensure content is always an array
      const formattedData = {
        ...data,
        content: Array.isArray(data.content)
          ? data.content
          : [data.content as unknown as string],
      };

      const response = await apiRequest(
        "PUT",
        `/api/admin/sections/${selectedSection.id}`,
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      setIsEditing(false);
      setSelectedSection(null);
      editForm.reset();
      toast({
        title: "Section updated",
        description: "The section has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating section",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete section mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/sections/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({
        title: "Section deleted",
        description: "The section has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting section",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Reorder section mutation
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
        `/api/admin/sections/${id}/reorder`,
        { direction },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sections"] });
      toast({
        title: "Section reordered",
        description: "The section order has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error reordering section",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmitAdd = (data: SectionFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: SectionFormValues) => {
    editMutation.mutate(data);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);

    // Parse content if needed
    const contentArray = Array.isArray(section.content)
      ? section.content
      : typeof section.content === "string"
        ? JSON.parse(section.content)
        : [section.content];

    // Set form values
    editForm.reset({
      title: section.title,
      subtitle: section.subtitle || "",
      content: contentArray,
      type: section.type,
      displayOrder: section.displayOrder || 1,
    });

    setIsEditing(true);
  };

  const handleDeleteSection = (section: Section) => {
    deleteMutation.mutate(section.id);
  };

  const handleReorderSection = (section: Section, direction: "up" | "down") => {
    reorderMutation.mutate({ id: section.id, direction });
  };

  // Helper function to add a new content field
  const addContentField = (formHook: any) => {
    const currentContent = formHook.getValues("content") || [];
    formHook.setValue("content", [...currentContent, ""]);
  };

  // Helper function to remove a content field
  const removeContentField = (formHook: any, index: number) => {
    const currentContent = formHook.getValues("content") || [];
    if (currentContent.length <= 1) return; // Don't remove the last one

    formHook.setValue(
      "content",
      currentContent.filter((_: any, i: number) => i !== index),
    );
  };

  if (isLoading) {
    return <div>Loading sections...</div>;
  }

  // Sort sections by order and type
  const sortedSections = [...filteredSections].sort(
    (a: Section, b: Section) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    },
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Sections Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Section</CardTitle>
            <CardDescription>
              Create a new content section for your portfolio
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Section title" {...field} />
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
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">Hero Section</SelectItem>
                            <SelectItem value="about">About Me</SelectItem>
                            <SelectItem value="professionalProject">
                              Professional Projects
                            </SelectItem>
                            <SelectItem value="personalProject">
                              Personal Projects
                            </SelectItem>
                            <SelectItem value="experience">
                              Experience
                            </SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="certification">
                              Certifications
                            </SelectItem>
                            <SelectItem value="featuredProject">
                              Featured Projects
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Section subtitle"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief tagline or description for this section
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Content Paragraphs</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addContentField(addForm)}
                    >
                      Add Paragraph
                    </Button>
                  </div>

                  {addForm.watch("content")?.map((_, index) => (
                    <div key={index} className="flex items-start gap-2 mb-3">
                      <FormField
                        control={addForm.control}
                        name={`content.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Textarea
                                placeholder={`Paragraph ${index + 1}`}
                                className="min-h-[80px]"
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
                        onClick={() => removeContentField(addForm, index)}
                        disabled={addForm.watch("content")?.length <= 1}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={addForm.control}
                  name="displayOrder"
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
                        Order in which section appears within its type (lower
                        number = higher position)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Section"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isEditing && selectedSection && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Section</CardTitle>
            <CardDescription>Update section details</CardDescription>
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Section title" {...field} />
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
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">Hero Section</SelectItem>
                            <SelectItem value="about">About Me</SelectItem>
                            <SelectItem value="professionalProject">
                              Professional Projects
                            </SelectItem>
                            <SelectItem value="personalProject">
                              Personal Projects
                            </SelectItem>
                            <SelectItem value="experience">
                              Experience
                            </SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="certification">
                              Certifications
                            </SelectItem>
                            <SelectItem value="featuredProject">
                              Featured Projects
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Section subtitle"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief tagline or description for this section
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Content Paragraphs</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addContentField(editForm)}
                    >
                      Add Paragraph
                    </Button>
                  </div>

                  {editForm.watch("content")?.map((_, index) => (
                    <div key={index} className="flex items-start gap-2 mb-3">
                      <FormField
                        control={editForm.control}
                        name={`content.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Textarea
                                placeholder={`Paragraph ${index + 1}`}
                                className="min-h-[80px]"
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
                        onClick={() => removeContentField(editForm, index)}
                        disabled={editForm.watch("content")?.length <= 1}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={editForm.control}
                  name="displayOrder"
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
                        Order in which section appears within its type (lower
                        number = higher position)
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
                      setSelectedSection(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending ? "Updating..." : "Update Section"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All Sections</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="professionalProject">
            Professional Projects
          </TabsTrigger>
          <TabsTrigger value="personalProject">Personal Projects</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="featuredProject">Featured Projects</TabsTrigger>
          <TabsTrigger value="certification">Certifications</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4">
        {sortedSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sections found. Add a new section to get started.
          </div>
        ) : (
          sortedSections.map((section: Section) => (
            <Card key={section.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100">
                        {sectionTypeLabels[section.type] || section.type}
                      </span>
                    </div>
                    {section.subtitle && (
                      <p className="text-sm text-gray-500 mb-2">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderSection(section, "up")}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderSection(section, "down")}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSection(section)}
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
                            This will permanently delete this section. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteSection(section)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-semibold mb-2">Content</h5>
                  {Array.isArray(section.content) ? (
                    section.content.map((contentItem, i) => (
                      <p key={i} className="text-sm mb-2">
                        {contentItem}
                      </p>
                    ))
                  ) : typeof section.content === "string" ? (
                    <p className="text-sm mb-2">{section.content}</p>
                  ) : (
                    <p className="text-sm mb-2 text-gray-500">
                      No content available
                    </p>
                  )}
                </div>

                {section.updatedAt && (
                  <div className="mt-3 text-xs text-gray-400">
                    Last updated: {new Date(section.updatedAt).toLocaleString()}
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
