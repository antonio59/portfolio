import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CaseStudyDetail, BlogPost } from "../../../../shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CaseStudyForm from "./CaseStudyForm";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Helper function to create query function
function getQueryFn(options = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint] = queryKey;
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  };
}

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()),
  published: z.boolean(),
  featured: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function CaseStudyManager() {
  const { toast } = useToast();
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(
    null,
  );
  const [selectedCaseStudy, setSelectedCaseStudy] =
    useState<CaseStudyDetail | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all blog posts
  const { data: blogPosts, isLoading: isLoadingBlogPosts } = useQuery({
    queryKey: ["/api/admin/blog/posts"],
    queryFn: getQueryFn(),
  });

  // Fetch all case studies
  const { data: caseStudies, isLoading: isLoadingCaseStudies } = useQuery({
    queryKey: ["/api/admin/blog/case-studies"],
    queryFn: getQueryFn(),
  });

  // Calculate which blog posts already have case studies
  const blogPostsWithCaseStudies = new Set(
    caseStudies?.map((study: CaseStudyDetail) => study.blogPostId) || [],
  );

  // Filter blog posts that don't have case studies yet
  const eligibleBlogPosts =
    blogPosts?.filter(
      (post: BlogPost) => !blogPostsWithCaseStudies.has(post.id),
    ) || [];

  // Mutation to create a case study
  const createCaseStudyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "POST",
        "/api/admin/blog/case-studies",
        data,
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study details added successfully",
      });
      setIsAddDialogOpen(false);
      setSelectedBlogPost(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/blog/case-studies"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add case study details",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a case study
  const updateCaseStudyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest(
        "PUT",
        `/api/admin/blog/case-studies/${id}`,
        data,
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study details updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCaseStudy(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/blog/case-studies"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update case study details",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a case study
  const deleteCaseStudyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        "DELETE",
        `/api/admin/blog/case-studies/${id}`,
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case study details deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCaseStudy(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/blog/case-studies"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete case study details",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new case study
  const handleAdd = (blogPost: BlogPost) => {
    setSelectedBlogPost(blogPost);
    setIsAddDialogOpen(true);
  };

  // Handle editing an existing case study
  const handleEdit = (caseStudy: CaseStudyDetail) => {
    setSelectedCaseStudy(caseStudy);
    setIsEditDialogOpen(true);
  };

  // Handle deleting a case study
  const handleDelete = (caseStudy: CaseStudyDetail) => {
    setSelectedCaseStudy(caseStudy);
    setIsDeleteDialogOpen(true);
  };

  // Find the blog post associated with a case study
  const getBlogPostForCaseStudy = (blogPostId: number) => {
    return blogPosts?.find((post: BlogPost) => post.id === blogPostId) || null;
  };

  // Handle form submission for adding a case study
  const handleAddSubmit = (data: any) => {
    if (!selectedBlogPost) return;

    createCaseStudyMutation.mutate({
      ...data,
      blogPostId: selectedBlogPost.id,
    });
  };

  // Handle form submission for updating a case study
  const handleEditSubmit = (data: any) => {
    if (!selectedCaseStudy) return;

    updateCaseStudyMutation.mutate({
      id: selectedCaseStudy.id,
      data: {
        ...data,
        blogPostId: selectedCaseStudy.blogPostId,
      },
    });
  };

  // Handle confirmation of deleting a case study
  const handleDeleteConfirm = () => {
    if (!selectedCaseStudy) return;

    deleteCaseStudyMutation.mutate(selectedCaseStudy.id);
  };

  const { data: options } = useQuery({
    queryKey: ['case-study-options'],
    queryFn: async () => {
      const response = await fetch('/api/case-studies/options');
      if (!response.ok) {
        throw new Error('Failed to fetch case study options');
      }
      return response.json();
    },
  });

  // Loading state
  if (isLoadingBlogPosts || isLoadingCaseStudies) {
    return (
      <div className="flex justify-center py-8">Loading case study data...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Case Studies</TabsTrigger>
          <TabsTrigger value="add">Add New Case Study</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="grid gap-4">
            {caseStudies && caseStudies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Project Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseStudies.map((caseStudy: CaseStudyDetail) => {
                    const blogPost = getBlogPostForCaseStudy(
                      caseStudy.blogPostId,
                    );
                    return (
                      <TableRow key={caseStudy.id}>
                        <TableCell className="font-medium">
                          {blogPost?.title ||
                            `Blog Post #${caseStudy.blogPostId}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {caseStudy.projectType}
                          </Badge>
                        </TableCell>
                        <TableCell>{caseStudy.client || "N/A"}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(caseStudy)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(caseStudy)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No case studies found</AlertTitle>
                <AlertDescription>
                  You haven't added any case studies yet. Go to the "Add New
                  Case Study" tab to create one.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>Add Case Study to Blog Post</AlertTitle>
            <AlertDescription>
              Select a blog post to add detailed case study information. Only
              blog posts without existing case studies are shown.
            </AlertDescription>
          </Alert>

          {eligibleBlogPosts.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {eligibleBlogPosts.map((post: BlogPost) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      {post.status === "published" ? (
                        <Badge className="bg-green-100 text-green-800">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleAdd(post)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Case Study
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>All blog posts have case studies</AlertTitle>
              <AlertDescription>
                All your blog posts already have case studies attached. Create a
                new blog post if you want to add more case studies.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Case Study Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Case Study for "{selectedBlogPost?.title}"
            </DialogTitle>
            <DialogDescription>
              Add detailed case study information for this blog post
            </DialogDescription>
          </DialogHeader>

          {selectedBlogPost && (
            <CaseStudyForm
              blogPostId={selectedBlogPost.id}
              onSubmit={handleAddSubmit}
              isSubmitting={createCaseStudyMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Case Study Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Case Study for "
              {getBlogPostForCaseStudy(selectedCaseStudy?.blogPostId || 0)
                ?.title || "Blog Post"}
              "
            </DialogTitle>
            <DialogDescription>
              Update the case study information
            </DialogDescription>
          </DialogHeader>

          {selectedCaseStudy && (
            <CaseStudyForm
              initialData={{
                blogPostId: selectedCaseStudy.blogPostId,
                title: selectedCaseStudy.title,
                slug: selectedCaseStudy.slug,
                client: selectedCaseStudy.client,
                projectType: selectedCaseStudy.projectType,
                role: selectedCaseStudy.role,
                duration: selectedCaseStudy.duration,
                technologies: selectedCaseStudy.technologies,
                problem: selectedCaseStudy.problem,
                solution: selectedCaseStudy.solution,
                results: selectedCaseStudy.results,
                challenges: selectedCaseStudy.challenges,
                learnings: selectedCaseStudy.learnings,
                testimonial: selectedCaseStudy.testimonial,
                metrics: selectedCaseStudy.metrics,
                gallery: selectedCaseStudy.gallery,
                galleryImages: selectedCaseStudy.galleryImages,
                images: selectedCaseStudy.images,
                videoUrl: selectedCaseStudy.videoUrl,
                relatedProjectIds: selectedCaseStudy.relatedProjectIds,
                featured: selectedCaseStudy.featured,
                featuredOrder: selectedCaseStudy.featuredOrder,
                relatedPosts: selectedCaseStudy.relatedPosts,
                externalLinks: selectedCaseStudy.externalLinks,
                seoKeywords: selectedCaseStudy.seoKeywords,
                seoDescription: selectedCaseStudy.seoDescription
              }}
              blogPostId={selectedCaseStudy.blogPostId}
              onSubmit={handleEditSubmit}
              isSubmitting={updateCaseStudyMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the case study for "
              {getBlogPostForCaseStudy(selectedCaseStudy?.blogPostId || 0)
                ?.title || "this blog post"}
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteCaseStudyMutation.isPending}
            >
              {deleteCaseStudyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
