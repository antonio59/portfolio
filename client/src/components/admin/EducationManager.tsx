import React, { useState } from "react"; // Add React import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig"; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Switch } from "@/components/ui/switch"; 

// Define combined type for Education, Certifications, and Badges
interface EducationCertItem {
  id: string; 
  type: 'education' | 'certification' | 'badge'; 
  title: string; 
  institution: string; 
  period?: string | null; 
  issueDate?: string | null; 
  expiryDate?: string | null; 
  description?: string | null; 
  skills?: string[] | null; 
  credentialID?: string | null; 
  credentialURL?: string | null; 
  imageUrl?: string | null; 
  featured?: boolean | null; 
  order?: number; 
}

// Define Firestore collection reference for combined items
const educationCertCollectionRef = collection(db, "educationAndCerts");

// Form validation schema for combined types
const educationCertSchema = z.object({
  type: z.enum(['education', 'certification', 'badge']),
  title: z.string().min(2, "Title/Degree/Badge Name is required"),
  institution: z.string().min(2, "Institution/Issuer is required"),
  period: z.string().optional().nullable(), 
  issueDate: z.string().optional().nullable(), 
  expiryDate: z.string().optional().nullable(), 
  description: z.string().optional().nullable(), 
  skills: z.array(z.string()).optional().nullable(), 
  credentialID: z.string().optional().nullable(), 
  credentialURL: z.string().url().optional().nullable(), 
  imageUrl: z.string().url().optional().nullable(), 
  featured: z.boolean().optional().nullable(), 
  order: z.number().int().optional(), // Make optional again
});

// Explicitly define form values type based on schema OUTPUT
type EducationCertFormValues = z.output<typeof educationCertSchema>;

// Rename component
export default function EducationCertManager() { 
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EducationCertItem | null>(null); // Use combined type
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Firestore Data Fetching ---
  const fetchItems = async (): Promise<EducationCertItem[]> => {
    // Temporarily remove orderBy to simplify query for debugging
    const q = query(educationCertCollectionRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
       const data = doc.data();
       return {
         id: doc.id,
         type: data.type || 'education', 
         title: data.title || "",
         institution: data.institution || "",
         period: data.period || null,
         issueDate: data.issueDate || null,
         expiryDate: data.expiryDate || null,
         description: data.description || null,
         skills: Array.isArray(data.skills) ? data.skills : null,
         credentialID: data.credentialID || null,
         credentialURL: data.credentialURL || null,
         imageUrl: data.imageUrl || null,
         featured: typeof data.featured === 'boolean' ? data.featured : null,
         order: typeof data.order === 'number' ? data.order : 1,
       } as EducationCertItem; 
    });
  };

  const { data: itemList = [], isLoading } = useQuery<EducationCertItem[]>({
    queryKey: ["educationAndCerts"], // Updated query key
    queryFn: fetchItems,
  });

  // Explicitly type useForm with the Zod schema type
  const addForm = useForm<z.infer<typeof educationCertSchema>>({
    resolver: zodResolver(educationCertSchema),
    defaultValues: {
      type: 'education', 
      title: "",
      institution: "",
      period: "",
      issueDate: "",
      expiryDate: "",
      description: "",
      skills: [],
      credentialID: "",
      credentialURL: "",
      imageUrl: "",
      featured: false,
      order: 1,
    },
  });

  // Explicitly type useForm with the Zod schema type
  const editForm = useForm<z.infer<typeof educationCertSchema>>({
    resolver: zodResolver(educationCertSchema),
    defaultValues: { 
      type: 'education',
      title: "",
      institution: "",
      period: "",
      issueDate: "",
      expiryDate: "",
      description: "",
      skills: [],
      credentialID: "",
      credentialURL: "",
      imageUrl: "",
      featured: false,
      order: 1,
    },
  });

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: async (data: EducationCertFormValues) => { 
      const dataToSave = { ...data, order: Number(data.order) || 1 };
      if (dataToSave.skills && typeof dataToSave.skills === 'string') {
         dataToSave.skills = (dataToSave.skills as string).split('\n').map(s => s.trim()).filter(s => s);
      } else if (!dataToSave.skills) {
         dataToSave.skills = []; 
      }
      const docRef = await addDoc(educationCertCollectionRef, dataToSave); 
      return docRef.id; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationAndCerts"] }); 
      setIsAdding(false);
      addForm.reset(); 
      toast({
        title: "Item added", 
        description: "The item has been added successfully.", 
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding item", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Edit item mutation
  const editMutation = useMutation({
    mutationFn: async (data: EducationCertFormValues) => { 
      if (!selectedItem?.id) throw new Error("No item selected for editing."); 
      const itemDocRef = doc(db, "educationAndCerts", selectedItem.id); 
      const dataToSave = { ...data, order: Number(data.order) || 1 };
      if (dataToSave.skills && typeof dataToSave.skills === 'string') {
         dataToSave.skills = (dataToSave.skills as string).split('\n').map(s => s.trim()).filter(s => s);
      } else if (!dataToSave.skills) {
         dataToSave.skills = []; 
      }
      await updateDoc(itemDocRef, dataToSave); 
      return selectedItem.id; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationAndCerts"] }); 
      setIsEditing(false);
      setSelectedItem(null); 
      editForm.reset();
      toast({
        title: "Item updated", 
        description: "The item has been updated successfully.", 
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating item", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { 
      if (!id) throw new Error("No item ID provided for deletion.");
      const itemDocRef = doc(db, "educationAndCerts", id); 
      await deleteDoc(itemDocRef); 
      return id; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationAndCerts"] }); 
      toast({
        title: "Item deleted", 
        description: "The item has been deleted successfully.", 
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting item", 
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmitAdd = (data: EducationCertFormValues) => { 
    addMutation.mutate(data);
  };

  const onSubmitEdit = (data: EducationCertFormValues) => { 
    editMutation.mutate(data);
  };

  const handleEdit = (item: EducationCertItem) => { 
    setSelectedItem(item); 
    editForm.reset({
      type: item.type,
      title: item.title,
      institution: item.institution,
      period: item.period || "",
      issueDate: item.issueDate || "",
      expiryDate: item.expiryDate || "",
      description: item.description || "",
      skills: item.skills || [], 
      credentialID: item.credentialID || "",
      credentialURL: item.credentialURL || "",
      imageUrl: item.imageUrl || "",
      featured: item.featured || false,
      order: item.order || 1,
    });
    setIsEditing(true);
  };

  const handleDelete = (item: EducationCertItem) => { 
    if (item.id) { 
      deleteMutation.mutate(item.id); 
    } else {
      toast({ title: "Error", description: "Item ID is missing.", variant: "destructive" });
    }
  };

  // Sort items
  const sortedItemList = [...itemList].sort((a, b) => { 
      if (a.type !== b.type) { return a.type.localeCompare(b.type); }
      return (a.order || 999) - (b.order || 999);
  });

  // Get current form values to conditionally render fields
  const addFormType = addForm.watch("type");
  const editFormType = editForm.watch("type");

  return (
    <div> 
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Education & Certs Management</h2> 
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <> <Plus className="mr-2 h-4 w-4" /> Add Item </>} 
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div> 
        <Card className="mb-6">
          <CardHeader> <CardTitle>Add New Item</CardTitle> </CardHeader>
          <CardContent>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                {/* Type Selector */}
                <FormField control={addForm.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="education">Education</SelectItem> <SelectItem value="certification">Certification</SelectItem> <SelectItem value="badge">Badge</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                {/* Common Fields */}
                <FormField control={addForm.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>{addFormType === 'education' ? 'Degree/Certificate' : 'Title/Badge Name'}</FormLabel> <FormControl><Input placeholder="Title..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={addForm.control} name="institution" render={({ field }) => ( <FormItem> <FormLabel>{addFormType === 'education' ? 'Institution' : 'Issuer'}</FormLabel> <FormControl><Input placeholder="Institution/Issuer..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                {/* Conditional Fields */}
                <React.Fragment>
                  {addFormType === 'education' && ( <FormField control={addForm.control} name="period" render={({ field }) => ( <FormItem> <FormLabel>Period</FormLabel> <FormControl><Input placeholder="2012 - 2016" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {(addFormType === 'certification' || addFormType === 'badge') && ( <FormField control={addForm.control} name="issueDate" render={({ field }) => ( <FormItem> <FormLabel>Issue Date</FormLabel> <FormControl><Input placeholder="YYYY-MM" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {addFormType === 'certification' && ( <FormField control={addForm.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date (Optional)</FormLabel> <FormControl><Input placeholder="YYYY-MM" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {(addFormType === 'education' || addFormType === 'certification') && ( <FormField control={addForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="Details..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {addFormType === 'certification' && ( <FormField control={addForm.control} name="skills" render={({ field }) => ( <FormItem> <FormLabel>Skills (One per line)</FormLabel> <FormControl><Textarea placeholder="Skill 1&#10;Skill 2" className="min-h-[80px]" value={Array.isArray(field.value) ? field.value.join("\n") : ""} onChange={e => field.onChange(e.target.value.split("\n").map(s => s.trim()).filter(s => s))} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {addFormType === 'certification' && ( <FormField control={addForm.control} name="credentialID" render={({ field }) => ( <FormItem> <FormLabel>Credential ID (Optional)</FormLabel> <FormControl><Input placeholder="ABC-123" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {(addFormType === 'certification' || addFormType === 'badge') && ( <FormField control={addForm.control} name="credentialURL" render={({ field }) => ( <FormItem> <FormLabel>Credential/Badge URL (Optional)</FormLabel> <FormControl><Input type="url" placeholder="https://verify..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {(addFormType === 'certification' || addFormType === 'badge') && ( <FormField control={addForm.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Image URL (Optional)</FormLabel> <FormControl><Input type="url" placeholder="https://image..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                  {(addFormType === 'certification' || addFormType === 'badge') && ( <FormField control={addForm.control} name="featured" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0"> <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl> <FormLabel>Featured?</FormLabel> </FormItem> )} /> )}
                </React.Fragment>
                {/* Order Field */}
                <FormField control={addForm.control} name="order" render={({ field }) => ( <FormItem> <FormLabel>Display Order</FormLabel> <FormControl><Input type="number" placeholder="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl> <FormDescription>Lower number appears first (within type)</FormDescription> <FormMessage /> </FormItem> )} />
                <div className="flex justify-end"> <Button type="submit" disabled={addMutation.isPending}> {addMutation.isPending ? "Adding..." : "Add Item"} </Button> </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div> 
      )}

      {/* Edit Form */}
      {isEditing && selectedItem && (
        <div> 
         <Card className="mb-6">
          <CardHeader> <CardTitle>Edit Item ({selectedItem.type})</CardTitle> </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                 {/* Type Selector (Readonly in Edit?) */}
                 <FormField control={editForm.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="education">Education</SelectItem> <SelectItem value="certification">Certification</SelectItem> <SelectItem value="badge">Badge</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                 {/* Common Fields */}
                 <FormField control={editForm.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>{editFormType === 'education' ? 'Degree/Certificate' : 'Title/Badge Name'}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={editForm.control} name="institution" render={({ field }) => ( <FormItem> <FormLabel>{editFormType === 'education' ? 'Institution' : 'Issuer'}</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Conditional Fields */}
                 <React.Fragment>
                   {editFormType === 'education' && ( <FormField control={editForm.control} name="period" render={({ field }) => ( <FormItem> <FormLabel>Period</FormLabel> <FormControl><Input {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {(editFormType === 'certification' || editFormType === 'badge') && ( <FormField control={editForm.control} name="issueDate" render={({ field }) => ( <FormItem> <FormLabel>Issue Date</FormLabel> <FormControl><Input {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {editFormType === 'certification' && ( <FormField control={editForm.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date (Optional)</FormLabel> <FormControl><Input {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {(editFormType === 'education' || editFormType === 'certification') && ( <FormField control={editForm.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {editFormType === 'certification' && ( <FormField control={editForm.control} name="skills" render={({ field }) => ( <FormItem> <FormLabel>Skills (One per line)</FormLabel> <FormControl><Textarea className="min-h-[80px]" value={Array.isArray(field.value) ? field.value.join("\n") : ""} onChange={e => field.onChange(e.target.value.split("\n").map(s => s.trim()).filter(s => s))} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {editFormType === 'certification' && ( <FormField control={editForm.control} name="credentialID" render={({ field }) => ( <FormItem> <FormLabel>Credential ID (Optional)</FormLabel> <FormControl><Input {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {(editFormType === 'certification' || editFormType === 'badge') && ( <FormField control={editForm.control} name="credentialURL" render={({ field }) => ( <FormItem> <FormLabel>Credential/Badge URL (Optional)</FormLabel> <FormControl><Input type="url" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {(editFormType === 'certification' || editFormType === 'badge') && ( <FormField control={editForm.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Image URL (Optional)</FormLabel> <FormControl><Input type="url" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} /> )}
                   {(editFormType === 'certification' || editFormType === 'badge') && ( <FormField control={editForm.control} name="featured" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0"> <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl> <FormLabel>Featured?</FormLabel> </FormItem> )} /> )}
                 </React.Fragment>
                 {/* Order Field */}
                 <FormField control={editForm.control} name="order" render={({ field }) => ( <FormItem> <FormLabel>Display Order</FormLabel> <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl> <FormDescription>Lower number appears first (within type)</FormDescription> <FormMessage /> </FormItem> )} />
                 <div className="flex justify-between"> <Button variant="outline" onClick={() => { setIsEditing(false); setSelectedItem(null); editForm.reset(); }}> Cancel </Button> <Button type="submit" disabled={editMutation.isPending}> {editMutation.isPending ? "Saving..." : "Save Changes"} </Button> </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div> 
      )}

      {/* Display List or Loading/Empty State */}
      <div className="space-y-4">
        {isLoading ? (
           <div>Loading entries...</div> 
        ) : sortedItemList.length === 0 ? (
          <p className="text-center text-gray-500">No entries added yet.</p>
        ) : (
          sortedItemList.map((entry: EducationCertItem) => ( 
             <Card key={entry.id}>
              <CardHeader className="flex flex-row justify-between items-start p-4">
                <div>
                  <CardTitle className="text-lg">{entry.title}</CardTitle> 
                  <CardDescription>
                    {entry.type === 'education' ? `${entry.institution} (${entry.period || 'N/A'})` : entry.institution}
                    {(entry.type === 'certification' || entry.type === 'badge') && entry.issueDate && ` - Issued: ${entry.issueDate}`}
                    {entry.type === 'certification' && entry.expiryDate && ` / Expires: ${entry.expiryDate}`}
                    {` - Type: ${entry.type}`}
                    {` - Order: ${entry.order ?? 'N/A'}`} 
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}> <Pencil className="h-4 w-4" /> </Button>
                  {/* Restore AlertDialog for Delete */}
                   <AlertDialog>
                    <AlertDialogTrigger asChild> <Button variant="ghost" size="sm"> <Trash2 className="h-4 w-4 text-red-500" /> </Button> </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader> <AlertDialogTitle>Delete Item?</AlertDialogTitle> <AlertDialogDescription> This action cannot be undone. This will permanently delete the entry for "{entry.title}". </AlertDialogDescription> </AlertDialogHeader>
                      <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={() => handleDelete(entry)} className="bg-red-600 hover:bg-red-700"> Delete </AlertDialogAction> </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              {(entry.description || (entry.skills && entry.skills.length > 0) || entry.imageUrl) && (
                <CardContent className="p-4 pt-0 text-sm text-gray-700 space-y-2">
                  {entry.description && <p>{entry.description}</p>}
                  {entry.skills && entry.skills.length > 0 && (
                    <div><strong>Skills:</strong> {entry.skills.join(', ')}</div>
                  )}
                   {entry.imageUrl && (
                     <div><strong>Image:</strong> <img src={entry.imageUrl} alt={entry.title} className="h-10 w-auto inline-block ml-2"/></div>
                   )}
                   {entry.credentialURL && (
                     <a href={entry.credentialURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Verify Credential</a>
                   )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}