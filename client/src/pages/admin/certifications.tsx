/**
 * Certifications Manager
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/admin/AdminLayout';
import { pb } from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  description?: string;
}

export default function AdminCertifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    description: '',
  });

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['admin-certifications'],
    queryFn: async () => {
      const records = await pb.collection('certifications').getFullList<Certification>({ sort: '-issue_date' });
      return records;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingCert) {
        return await pb.collection('certifications').update(editingCert.id, data);
      } else {
        return await pb.collection('certifications').create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Certification saved' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await pb.collection('certifications').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      toast({ title: 'Certification deleted' });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', issuer: '', issue_date: '', credential_url: '', description: '' });
    setEditingCert(null);
  };

  const openEditDialog = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      issue_date: cert.issue_date,
      credential_url: cert.credential_url || '',
      description: cert.description || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Certifications</h1>
            <p className="text-muted-foreground mt-2">Manage your professional certifications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Certification</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingCert ? 'Edit' : 'Add'} Certification</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Issuer *</Label>
                  <Input value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date *</Label>
                  <Input type="month" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Credential URL</Label>
                  <Input type="url" value={formData.credential_url} onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : certifications.length === 0 ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">No certifications yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{cert.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{cert.issuer} • {cert.issue_date}</p>
                      {cert.description && <p className="text-sm mt-2">{cert.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(cert)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(cert.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
