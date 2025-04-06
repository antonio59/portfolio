// client/src/components/admin/ContactManager.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the structure for the Contact section data
interface ContactSection {
  id: string; // Document ID (e.g., 'contact-content')
  title: string;
  subtitle?: string | null;
  content?: string[] | null; // e.g., [email, phone, message_prompt]
  type: 'contact';
}

// Firestore collection reference for the new 'contact' collection
const contactCollectionRef = collection(db, "contact");

// Form validation schema for Contact section
// Assuming title, subtitle, and content[0] for a primary message/email
const contactSectionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().optional().nullable(),
  primaryContent: z.string().optional().nullable(), // Representing content[0]
});

type ContactFormValues = z.infer<typeof contactSectionSchema>;

// Assume a fixed document ID for the single Contact document
const CONTACT_DOC_ID = "contact-data"; // Use a consistent ID

export default function ContactManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- Firestore Data Fetching for the single contact document ---
  const fetchContactSection = async (): Promise<ContactSection | null> => {
    // Fetch the specific document from the 'contact' collection
    const docRef = doc(db, "contact", CONTACT_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // No need to check type anymore
        return {
            id: docSnap.id, // Should be CONTACT_DOC_ID
            title: data.title || "",
            subtitle: data.subtitle || null,
            content: Array.isArray(data.content) ? data.content : null,
            type: 'contact', // Keep for interface consistency
        };
    }
     // No fallback query needed
    return null;
  };

  const { data: contactSection, isLoading: queryLoading, error } = useQuery<ContactSection | null>({
    queryKey: ["contactSection"],
    queryFn: fetchContactSection,
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      primaryContent: "",
    },
  });

  // Update form defaults when data loads
  useEffect(() => {
    setIsLoadingData(queryLoading);
    if (contactSection) {
      form.reset({
        title: contactSection.title,
        subtitle: contactSection.subtitle || "",
        primaryContent: (Array.isArray(contactSection.content) && contactSection.content.length > 0) ? contactSection.content[0] : "",
      });
    } else if (!queryLoading) {
        form.reset({ title: "", subtitle: "", primaryContent: "" });
    }
  }, [contactSection, form, queryLoading]);

  // Edit/Update mutation
  // Edit/Update mutation for the single contact document
  const upsertMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // Point to the specific document in the 'contact' collection
      const docRef = doc(db, "contact", CONTACT_DOC_ID);
      const dataToSave: Partial<ContactSection> = {
        title: data.title,
        subtitle: data.subtitle || null,
        content: data.primaryContent ? [data.primaryContent] : [], // Store primary content in array
        // type: 'contact', // Type field no longer needed in document
      };
      await setDoc(docRef, dataToSave, { merge: true });
      return CONTACT_DOC_ID;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactSection"] });
      toast({
        title: "Contact Section Updated",
        description: "The Contact section has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Contact Section",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    upsertMutation.mutate(data);
  };

   if (isLoadingData) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

   if (error) {
      return <div className="text-red-500 p-4">Error loading Contact section data: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Section Management</CardTitle>
        <CardDescription>Update the introductory content for the Contact section.</CardDescription>
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
                    <Input placeholder="e.g., Get In Touch" {...field} />
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
                    <Input placeholder="e.g., Let's connect!" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="primaryContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Content / Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Feel free to reach out via email at..."
                      className="min-h-[100px]"
                      {...field}
                       value={field.value ?? ""}
                    />
                  </FormControl>
                   <FormDescription>
                      Main text displayed in the contact section (e.g., preferred contact method or intro message).
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