import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CaseStudyDetail } from "../../../../shared/schema";
import { Switch } from "@/components/ui/switch";

// Define the form schema with validation
const formSchema = z.object({
  blogPostId: z.number(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  client: z.string().min(1, "Client is required"),
  projectType: z.string().min(1, "Project type is required"),
  role: z.string().optional(),
  duration: z.string().optional(),
  technologies: z.array(z.string()),
  problem: z.string().min(1, "Problem is required"),
  solution: z.string().min(1, "Solution is required"),
  results: z.string().min(1, "Results are required"),
  challenges: z.array(z.string()).optional(),
  learnings: z.array(z.string()).optional(),
  testimonial: z.object({
    author: z.string(),
    role: z.string(),
    company: z.string(),
    content: z.string()
  }).optional(),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.string(),
    description: z.string().optional()
  })).optional(),
  gallery: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional()
  })).optional(),
  galleryImages: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  relatedProjectIds: z.array(z.number()).optional(),
  featured: z.boolean(),
  featuredOrder: z.number().optional(),
  relatedPosts: z.array(z.number()).optional(),
  externalLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
    description: z.string().optional()
  })).optional(),
  seoKeywords: z.array(z.string()).optional(),
  seoDescription: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CaseStudyFormProps {
  initialData?: Partial<CaseStudyDetail>;
  blogPostId: number;
  onSubmit: SubmitHandler<FormValues>;
  isSubmitting: boolean;
}

// Helper function to convert string data to array
const stringToArray = (value: string | undefined | null): string[] => {
  if (!value) return [];
  return value.split("\n").filter((item) => item.trim() !== "");
};

// Helper function to convert array to string for textarea
const arrayToString = (arr: string[] | undefined | null): string => {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join("\n");
};

export default function CaseStudyForm({
  initialData,
  blogPostId,
  onSubmit,
  isSubmitting,
}: CaseStudyFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blogPostId,
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      client: initialData?.client || "",
      projectType: initialData?.projectType || "",
      role: initialData?.role || "",
      duration: initialData?.duration || "",
      technologies: initialData?.technologies || [],
      problem: initialData?.problem || "",
      solution: initialData?.solution || "",
      results: initialData?.results || "",
      challenges: initialData?.challenges || [],
      learnings: initialData?.learnings || [],
      testimonial: initialData?.testimonial || undefined,
      metrics: initialData?.metrics || [],
      gallery: initialData?.gallery || [],
      galleryImages: initialData?.galleryImages || [],
      images: initialData?.images || [],
      videoUrl: initialData?.videoUrl || "",
      relatedProjectIds: initialData?.relatedProjectIds || [],
      featured: initialData?.featured || false,
      featuredOrder: initialData?.featuredOrder || undefined,
      relatedPosts: initialData?.relatedPosts || [],
      externalLinks: initialData?.externalLinks || [],
      seoKeywords: initialData?.seoKeywords || [],
      seoDescription: initialData?.seoDescription || ""
    },
  });

  // When initial data changes, update form values
  useEffect(() => {
    if (initialData) {
      // Reset the form with initial data
      form.reset({
        blogPostId,
        title: initialData.title || "",
        slug: initialData.slug || "",
        client: initialData.client || "",
        projectType: initialData.projectType || "",
        role: initialData.role || "",
        duration: initialData.duration || "",
        technologies: initialData.technologies || [],
        problem: initialData.problem || "",
        solution: initialData.solution || "",
        results: initialData.results || "",
        challenges: initialData.challenges || [],
        learnings: initialData.learnings || [],
        testimonial: initialData.testimonial || undefined,
        metrics: initialData.metrics || [],
        gallery: initialData.gallery || [],
        galleryImages: initialData.galleryImages || [],
        images: initialData.images || [],
        videoUrl: initialData.videoUrl || "",
        relatedProjectIds: initialData.relatedProjectIds || [],
        featured: initialData.featured || false,
        featuredOrder: initialData.featuredOrder || undefined,
        relatedPosts: initialData.relatedPosts || [],
        externalLinks: initialData.externalLinks || [],
        seoKeywords: initialData.seoKeywords || [],
        seoDescription: initialData.seoDescription || ""
      });
    }
  }, [initialData, form, blogPostId]);

  // Form submission handler
  const handleSubmit: SubmitHandler<FormValues> = (values) => {
    // Process textarea inputs to convert strings to arrays
    const processedValues = {
      ...values,
      challenges:
        typeof values.challenges === "string"
          ? stringToArray(values.challenges as unknown as string)
          : values.challenges,
      learnings:
        typeof values.learnings === "string"
          ? stringToArray(values.learnings as unknown as string)
          : values.learnings,
      images:
        typeof values.images === "string"
          ? stringToArray(values.images as unknown as string)
          : values.images,
    };

    onSubmit(processedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.split(",").map((t) => t.trim()))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="solution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solution</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="results"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Results</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="challenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenges</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.split(",").map((c) => c.trim()))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learnings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learnings</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.split(",").map((l) => l.trim()))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Case Study"}
        </Button>
      </form>
    </Form>
  );
}
