// client/src/components/admin/AboutManager.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs, // Keep for query fallback
  getDoc, // Add getDoc for single document fetch
  updateDoc,
  doc,
  setDoc // Use setDoc for potential creation if not exists
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
import { Loader2 } from "lucide-react";

// Define the structure for the About section data
interface AboutSection {
  id: string; // Document ID (e.g., 'about-content')
  title: string;
  subtitle?: string | null;
  content: string[];
  type: 'about'; // Ensure type is always 'about'
}

// Firestore collection reference for the new 'about' collection
const aboutCollectionRef = collection(db, "about");

// Form validation schema for About section
const aboutSectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional().nullable(),
  // Use a single string for the textarea, split/join on save/load
  content: z.string().min(1, "Content is required"),
});

type AboutFormValues = z.infer<typeof aboutSectionSchema>;

// Assume a fixed document ID for the single About document
const ABOUT_DOC_ID = "about-data"; // Use a consistent ID

export default function AboutManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingData, setIsLoadingData] = useState(true); // Separate loading state

  // --- Firestore Data Fetching for the single about document ---
  const fetchAboutSection = async (): Promise<AboutSection | null> => {
    // Fetch the specific document from the 'about' collection
    const docRef = doc(db, "about", ABOUT_DOC_ID);
    const docSnap = await getDoc(docRef); // Use getDoc function

    if (docSnap.exists()) {
        const data = docSnap.data();
        // No need to check type anymore
        return {
            id: docSnap.id, // Should be ABOUT_DOC_ID
            title: data.title || "",
            subtitle: data.subtitle || null,
            content: Array.isArray(data.content) ? data.content : [],
            type: 'about', // Keep for interface consistency
        };
    }
    // No fallback query needed
    return null;
  };

  const { data: aboutSection, isLoading: queryLoading, error } = useQuery<AboutSection | null>({
    queryKey: ["aboutSection"],
    queryFn: fetchAboutSection,
  });

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
    },
  });

  // Update form defaults when data loads
  useEffect(() => {
    setIsLoadingData(queryLoading); // Update local loading state
    if (aboutSection) {
      form.reset({
        title: aboutSection.title,
        subtitle: aboutSection.subtitle || "",
        content: Array.isArray(aboutSection.content) ? aboutSection.content.join("\n\n") : "", // Join paragraphs for textarea
      });
    } else if (!queryLoading) {
        // If loading finished and no data, reset to empty defaults
        form.reset({ title: "", subtitle: "", content: "" });
    }
  }, [aboutSection, form, queryLoading]);


  // Edit/Update mutation (using setDoc with merge for upsert behavior)
  // Edit/Update mutation for the single about document
  const upsertMutation = useMutation({
    mutationFn: async (data: AboutFormValues) => {
      // Point to the specific document in the 'about' collection
      const docRef = doc(db, "about", ABOUT_DOC_ID);
      const dataToSave = {
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.content.split('\n\n').map(p => p.trim()).filter(p => p), // Split textarea into array
        // type: 'about', // Type field no longer needed in document
        // Add displayOrder if needed, e.g., displayOrder: 2
      };
      // Use setDoc with merge to create or update
      await setDoc(docRef, dataToSave, { merge: true });
      return ABOUT_DOC_ID;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aboutSection"] });
      toast({
        title: "About Section Updated",
        description: "The About section has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving About Section",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AboutFormValues) => {
    upsertMutation.mutate(data);
  };

  if (isLoadingData) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
      return <div className="text-red-500 p-4">Error loading About section data: {error.message}</div>;
  }

  // If no data found after loading, maybe show a message or allow creation via the form
  // if (!aboutSection && !isLoadingData) {
  //    return <div>No About section data found. You can create it using the form below.</div>;
  // }


  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section Management</CardTitle>
        <CardDescription>Update the content for the 'About Me' section.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title</FormLabel>
                  <FormControl>
                    <Input placeholder="About Me" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="A brief introduction" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the main content for the About section here. Separate paragraphs with double line breaks."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                      Separate paragraphs with double line breaks (press Enter twice).
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