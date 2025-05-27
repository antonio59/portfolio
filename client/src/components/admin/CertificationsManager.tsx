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
import { Switch } from "@/components/ui/switch";
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
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import type { Certification } from "@shared/schema";

// Form validation schema
const certificationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  issuer: z.string().min(2, "Issuer must be at least 2 characters"),
  issueDate: z.string(),
  expiryDate: z.string().optional().nullable(),
  credentialID: z.string().optional().nullable(),
  credentialURL: z.string().url().optional().nullable(),
  description: z.string(),
  skills: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional().nullable(),
});

type CertificationFormValues = z.infer<typeof certificationSchema>;

export default function CertificationsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCertification, setSelectedCertification] =
    useState<Certification | null>(null);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  // Fetch certifications
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["/api/admin/certifications"],
  });

  // Filter certifications based on the active tab
  const filteredCertifications =
    filter === "all"
      ? certifications
      : filter === "featured"
        ? certifications.filter((c: Certification) => c.featured)
        : certifications.filter((c: Certification) => !c.featured);

  const addForm = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialID: "",
      credentialURL: "",
      description: "",
      skills: [],
      featured: false,
      imageUrl: "",
    },
  });

  const editForm = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialID: "",
      credentialURL: "",
      description: "",
      skills: [],
      featured: false,
      imageUrl: "",
    },
  });

  // Add certification mutation
  const addMutation = useMutation({
    mutationFn: async (data: CertificationFormValues) => {
      // Format skills if it's a comma-separated string
      const formattedData = {
        ...data,
        skills:
          typeof data.skills === "string"
            ? data.skills.split(",").map((s) => s.trim())
            : data.skills,
      };

      const response = await apiRequest(
        "POST",
        "/api/admin/certifications",
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/certifications"],
      });
      setIsAdding(false);
      addForm.reset();
      toast({
        title: "Certification added",
        description: "The certification has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding certification",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Edit certification mutation
  const editMutation = useMutation({
    mutationFn: async (data: CertificationFormValues) => {
      if (!selectedCertification) return null;

      // Format skills if it's a comma-separated string
      const formattedData = {
        ...data,
        skills:
          typeof data.skills === "string"
            ? data.skills.split(",").map((s) => s.trim())
            : data.skills,
      };

      const response = await apiRequest(
        "PUT",
        `/api/admin/certifications/${selectedCertification.id}`,
        formattedData,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/certifications"],
      });
      setIsEditing(false);
      setSelectedCertification(null);
      editForm.reset();
      toast({
        title: "Certification updated",
        description: "The certification has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating certification",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete certification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/certifications/${id}`,
      );
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/certifications"],
      });
      toast({
        title: "Certification deleted",
        description: "The certification has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting certification",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmitAdd = (data: CertificationFormValues) => {
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: CertificationFormValues) => {
    editMutation.mutate(data);
  };

  const handleEditCertification = (certification: Certification) => {
    setSelectedCertification(certification);

    // Format skills for the form if it's JSON or array
    const skills = Array.isArray(certification.skills)
      ? certification.skills
      : typeof certification.skills === "string"
        ? JSON.parse(certification.skills)
        : [];

    // Set form values
    editForm.reset({
      title: certification.title,
      issuer: certification.issuer,
      issueDate: certification.issueDate,
      expiryDate: certification.expiryDate || "",
      credentialID: certification.credentialID || "",
      credentialURL: certification.credentialURL || "",
      description: certification.description,
      skills,
      featured: certification.featured || false,
      imageUrl: certification.imageUrl || "",
    });

    setIsEditing(true);
  };

  const handleDeleteCertification = (certification: Certification) => {
    deleteMutation.mutate(certification.id);
  };

  if (isLoading) {
    return <div>Loading certifications...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Certifications Management</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? (
            "Cancel"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </>
          )}
        </Button>
      </div>

      <div className="flex mb-6 space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "featured" ? "default" : "outline"}
          onClick={() => setFilter("featured")}
        >
          Featured
        </Button>
        <Button
          variant={filter === "regular" ? "default" : "outline"}
          onClick={() => setFilter("regular")}
        >
          Regular
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Certification</CardTitle>
            <CardDescription>
              Create a new certification in your portfolio
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
                        <FormLabel>Certification Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Certification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="issuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input placeholder="June 2023" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the certification was issued
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="June 2026"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          When the certification expires (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="credentialID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC-123456"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="credentialURL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://verify.example.com/abc123"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to verify the certification
                        </FormDescription>
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
                          placeholder="Describe the certification..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Management, Risk Assessment, etc. (comma separated)"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value || ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((s) => s.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter skills related to this certification separated by
                        commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the certification badge or logo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <FormLabel>Featured Certification</FormLabel>
                          <FormDescription>
                            Featured certifications appear prominently in the
                            certification section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Certification"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isEditing && selectedCertification && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Certification</CardTitle>
            <CardDescription>Update certification details</CardDescription>
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
                        <FormLabel>Certification Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Certification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="issuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuing Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input placeholder="June 2023" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the certification was issued
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="June 2026"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          When the certification expires (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="credentialID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC-123456"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="credentialURL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://verify.example.com/abc123"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to verify the certification
                        </FormDescription>
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
                          placeholder="Describe the certification..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Project Management, Risk Assessment, etc. (comma separated)"
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value || ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((s) => s.trim()),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter skills related to this certification separated by
                        commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the certification badge or logo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <FormLabel>Featured Certification</FormLabel>
                          <FormDescription>
                            Featured certifications appear prominently in the
                            certification section
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedCertification(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending
                      ? "Updating..."
                      : "Update Certification"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredCertifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No certifications found. Add a new certification to get started.
          </div>
        ) : (
          filteredCertifications.map((certification: Certification) => (
            <Card key={certification.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {certification.imageUrl && (
                  <div className="w-full md:w-1/4 min-h-[150px] bg-gray-100">
                    <img
                      src={certification.imageUrl}
                      alt={certification.title}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">
                          {certification.title}
                        </h3>
                        {certification.featured && (
                          <Star className="ml-2 h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {certification.issuer} • Issued:{" "}
                        {certification.issueDate}
                        {certification.expiryDate && (
                          <span> • Expires: {certification.expiryDate}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCertification(certification)}
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
                              This will permanently delete this certification.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() =>
                                handleDeleteCertification(certification)
                              }
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <p className="text-sm mt-2">{certification.description}</p>

                  {certification.credentialID && (
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Credential ID:</span>{" "}
                      {certification.credentialID}
                    </p>
                  )}

                  {Array.isArray(certification.skills) &&
                    certification.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {certification.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                  {certification.credentialURL && (
                    <div className="mt-3">
                      <a
                        href={certification.credentialURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Verify Credential
                      </a>
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
