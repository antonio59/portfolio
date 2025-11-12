/**
 * Experiences Manager
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { pb } from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

interface Experience {
  id: string;
  role: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
  created: string;
}

export default function AdminExperiences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: async () => {
      const records = await pb.collection('experiences').getFullList<Experience>({
        sort: '-start_date',
      });
      return records;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        end_date: data.end_date || null,
      };

      if (editingExp) {
        return await pb.collection('experiences').update(editingExp.id, payload);
      } else {
        return await pb.collection('experiences').create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: 'Experience saved' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('experiences').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      toast({ title: 'Experience deleted' });
    },
  });

  const resetForm = () => {
    setFormData({ role: '', company: '', start_date: '', end_date: '', description: '' });
    setEditingExp(null);
  };

  const openEditDialog = (exp: Experience) => {
    setEditingExp(exp);
    setFormData({
      role: exp.role,
      company: exp.company,
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      description: exp.description,
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Work Experience</h1>
            <p className="text-muted-foreground mt-2">Manage your professional experience</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Experience</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExp ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="month" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (leave empty if current)</Label>
                    <Input type="month" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <RichTextEditor content={formData.description} onChange={(html) => setFormData({ ...formData, description: html })} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : experiences.length === 0 ? (
          <Card><CardContent className="text-center py-12 text-muted-foreground">No experiences yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {experiences.map((exp) => (
              <Card key={exp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{exp.role}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </p>
                      <div className="text-sm mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(exp)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(exp.id); }}>
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
