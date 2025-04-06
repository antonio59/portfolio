// client/src/components/admin/HeroManager.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Keep if subtitle becomes textarea
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the structure for the Hero section data
interface HeroSection {
  id: string; // Document ID (e.g., 'hero-content')
  title: string; // Main headline (might be split in UI)
  subtitle?: string | null; // Tagline or description
  content?: string[] | null; // Keep flexible, maybe for call to action?
  type: 'hero';
}

// Firestore collection reference for the new 'hero' collection
const heroCollectionRef = collection(db, "hero");

// Form validation schema for Hero section
// Assuming 'title' is main headline, 'subtitle' is tagline, 'content[0]' is CTA text
const heroSectionSchema = z.object({
  title: z.string().min(2, "Title/Headline is required"),
  subtitle: z.string().optional().nullable(),
  callToAction: z.string().optional().nullable(), // Representing content[0] as CTA
});

type HeroFormValues = z.infer<typeof heroSectionSchema>;

// Assume a fixed document ID for the single Hero document
const HERO_DOC_ID = "hero-data"; // Use a consistent ID for the single doc

export default function HeroManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Firestore Data Fetching for the single hero document ---
  const fetchHeroSection = async (): Promise<HeroSection | null> => {
    // Fetch the specific document from the 'hero' collection
    const docRef = doc(db, "hero", HERO_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // No need to check type anymore as it's in its own collection
        return {
            id: docSnap.id, // Should be HERO_DOC_ID
            title: data.title || "",
            subtitle: data.subtitle || null,
            content: Array.isArray(data.content) ? data.content : null,
            type: 'hero', // Keep for interface consistency if needed, but redundant
        };
    }
    // No fallback query needed, just return null if the doc doesn't exist
    return null;
  };

  const { data: heroSection, isLoading: queryLoading, error } = useQuery<HeroSection | null>({
    queryKey: ["heroSection"],
    queryFn: fetchHeroSection,
  });

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      callToAction: "",
    },
  });

  // Update form defaults when data loads
  useEffect(() => {
    setIsLoadingData(queryLoading);
    if (heroSection) {
      form.reset({
        title: heroSection.title,
        subtitle: heroSection.subtitle || "",
        // Extract CTA from content array if it exists
        callToAction: (Array.isArray(heroSection.content) && heroSection.content.length > 0) ? heroSection.content[0] : "",
      });
    } else if (!queryLoading) {
        form.reset({ title: "", subtitle: "", callToAction: "" });
    }
  }, [heroSection, form, queryLoading]);

  // Edit/Update mutation
  // Edit/Update mutation for the single hero document
  const upsertMutation = useMutation({
    mutationFn: async (data: HeroFormValues) => {
      // Point to the specific document in the 'hero' collection
      const docRef = doc(db, "hero", HERO_DOC_ID);
      const dataToSave: Partial<HeroSection> = { // Use Partial for flexibility
        title: data.title,
        subtitle: data.subtitle || null,
        // Store CTA back into content array
        content: data.callToAction ? [data.callToAction] : [],
        // type: 'hero', // Type field is no longer needed within the document itself
      };
      await setDoc(docRef, dataToSave, { merge: true });
      return HERO_DOC_ID;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSection"] });
      toast({
        title: "Hero Section Updated",
        description: "The Hero section has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Hero Section",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: HeroFormValues) => {
    upsertMutation.mutate(data);
  };

  if (isLoadingData) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

   if (error) {
      return <div className="text-red-500 p-4">Error loading Hero section data: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section Management</CardTitle>
        <CardDescription>Update the content for the main Hero section.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Headline</FormLabel>
                  <FormControl>
                    {/* Use Textarea if title can be long or needs line breaks */}
                    <Input placeholder="e.g., Antonio Smith" {...field} />
                  </FormControl>
                   <FormDescription>
                      The primary text displayed in the hero section.
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle / Tagline (Optional)</FormLabel>
                  <FormControl>
                     {/* Use Textarea if subtitle can be long */}
                    <Input placeholder="e.g., Full Stack Developer | AI Enthusiast" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="callToAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call to Action Button Text (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., View My Work" {...field} value={field.value ?? ""} />
                  </FormControl>
                   <FormDescription>
                      Text for the primary button in the hero section (link managed elsewhere or hardcoded).
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}