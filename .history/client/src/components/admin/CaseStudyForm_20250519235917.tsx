import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { InsertCaseStudyDetail } from "../../../../shared/schema";

// Define the form schema with validation
const formSchema = z.object({
  blogPostId: z.number({
    required_error: "Blog post ID is required",
  }),
  clientName: z.string().optional(),
  industry: z.string().optional(),
  projectDuration: z.string().optional(),
  completionDate: z.string().optional(),
  challengesFaced: z.array(z.string()).optional(),
  solutionsProvided: z.array(z.string()).optional(),
  outcomesResults: z.array(z.string()).optional(),
  methodologyApproach: z.string().optional(),
  keyFeatures: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  teamSize: z.string().optional(),
  role: z.string().optional(),
  testimonial: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  testimonialPosition: z.string().optional(),
  clientLogo: z.string().optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  projectType: z.string({
    required_error: "Project type is required",
  }),
  relatedProjectIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CaseStudyFormProps {
  initialData?: Partial<FormValues>;
  blogPostId: number;
  onSubmit: (data: FormValues) => void;
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

export function CaseStudyForm({
  initialData,
  blogPostId,
  onSubmit,
  isSubmitting,
}: CaseStudyFormProps) {
  const { toast } = useToast();

  // Initialize form with defaults or initial data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blogPostId,
      clientName: "",
      industry: "",
      projectDuration: "",
      completionDate: "",
      challengesFaced: [],
      solutionsProvided: [],
      outcomesResults: [],
      methodologyApproach: "",
      keyFeatures: [],
      technologies: [],
      teamSize: "",
      role: "",
      testimonial: "",
      testimonialAuthor: "",
      testimonialPosition: "",
      clientLogo: "",
      images: [],
      videoUrl: "",
      projectType: "",
      relatedProjectIds: [],
      ...initialData,
    },
  });

  // When initial data changes, update form values
  useEffect(() => {
    if (initialData) {
      // Reset the form with initial data
      form.reset({
        blogPostId,
        clientName: initialData.clientName || "",
        industry: initialData.industry || "",
        projectDuration: initialData.projectDuration || "",
        completionDate: initialData.completionDate || "",
        challengesFaced: initialData.challengesFaced || [],
        solutionsProvided: initialData.solutionsProvided || [],
        outcomesResults: initialData.outcomesResults || [],
        methodologyApproach: initialData.methodologyApproach || "",
        keyFeatures: initialData.keyFeatures || [],
        technologies: initialData.technologies || [],
        teamSize: initialData.teamSize || "",
        role: initialData.role || "",
        testimonial: initialData.testimonial || "",
        testimonialAuthor: initialData.testimonialAuthor || "",
        testimonialPosition: initialData.testimonialPosition || "",
        clientLogo: initialData.clientLogo || "",
        images: initialData.images || [],
        videoUrl: initialData.videoUrl || "",
        projectType: initialData.projectType || "",
        relatedProjectIds: initialData.relatedProjectIds || [],
      });
    }
  }, [initialData, form, blogPostId]);

  // Form submission handler
  const handleSubmit = (values: FormValues) => {
    // Process textarea inputs to convert strings to arrays
    const processedValues = {
      ...values,
      challengesFaced:
        typeof values.challengesFaced === "string"
          ? stringToArray(values.challengesFaced as unknown as string)
          : values.challengesFaced,
      solutionsProvided:
        typeof values.solutionsProvided === "string"
          ? stringToArray(values.solutionsProvided as unknown as string)
          : values.solutionsProvided,
      outcomesResults:
        typeof values.outcomesResults === "string"
          ? stringToArray(values.outcomesResults as unknown as string)
          : values.outcomesResults,
      keyFeatures:
        typeof values.keyFeatures === "string"
          ? stringToArray(values.keyFeatures as unknown as string)
          : values.keyFeatures,
      technologies:
        typeof values.technologies === "string"
          ? stringToArray(values.technologies as unknown as string)
          : values.technologies,
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
        {/* Project Type */}
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type*</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Web Development, Mobile App, Consulting"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Name */}
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Client or Company Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Healthcare, Finance, Education"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Duration */}
        <FormField
          control={form.control}
          name="projectDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Duration</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3 months, 1 year" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Completion Date */}
        <FormField
          control={form.control}
          name="completionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completion Date</FormLabel>
              <FormControl>
                <Input placeholder="e.g., January 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Role</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Project Manager, Lead Developer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Team Size */}
        <FormField
          control={form.control}
          name="teamSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Size</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 people" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Challenges Faced */}
        <FormField
          control={form.control}
          name="challengesFaced"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenges Faced</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each challenge on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Solutions Provided */}
        <FormField
          control={form.control}
          name="solutionsProvided"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solutions Provided</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each solution on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Outcomes Results */}
        <FormField
          control={form.control}
          name="outcomesResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcomes & Results</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each outcome on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Methodology & Approach */}
        <FormField
          control={form.control}
          name="methodologyApproach"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Methodology & Approach</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your methodology and approach"
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Key Features */}
        <FormField
          control={form.control}
          name="keyFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Features</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each feature on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Technologies */}
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies Used</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each technology on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Testimonial */}
        <FormField
          control={form.control}
          name="testimonial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testimonial</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Client testimonial"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Testimonial Author */}
        <FormField
          control={form.control}
          name="testimonialAuthor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testimonial Author</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Testimonial Position */}
        <FormField
          control={form.control}
          name="testimonialPosition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author's Position</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CEO, Project Sponsor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Logo */}
        <FormField
          control={form.control}
          name="clientLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Images</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter each image URL on a new line"
                  value={arrayToString(field.value)}
                  onChange={(e) =>
                    field.onChange(stringToArray(e.target.value))
                  }
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video URL */}
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/video.mp4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Case Study Details"}
        </Button>
      </form>
    </Form>
  );
}
