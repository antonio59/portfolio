/**
 * Projects Manager with Featured Control
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { pb } from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  github_url?: string;
  technologies?: string;
  is_featured?: boolean;
  created: string;
}

export default function AdminProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    github_url: '',
    technologies: '',
    is_featured: false,
  });

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const records = await pb.collection('projects').getFullList<Project>({
        sort: '-created',
      });
      return records;
    },
  });

  const featuredCount = projects.filter(p => p.is_featured).length;

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        technologies: data.technologies, // Keep as string, we'll parse on frontend
      };

      if (editingProject) {
        return await pb.collection('projects').update(editingProject.id, payload);
      } else {
        return await pb.collection('projects').create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingProject ? 'Project updated' : 'Project created',
        description: 'Your project has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save project',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('projects').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been removed.',
      });
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      await pb.collection('projects').update(id, { is_featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: 'Featured status updated',
        description: 'The project showcase has been updated.',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      project_url: '',
      github_url: '',
      technologies: '',
      is_featured: false,
    });
    setEditingProject(null);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url || '',
      project_url: project.project_url || '',
      github_url: project.github_url || '',
      technologies: project.technologies || '',
      is_featured: project.is_featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage your portfolio projects • {featuredCount} featured (shown as highlighted cards)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogDescription>
                  Add your project details with rich text formatting
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project_url">Project URL</Label>
                    <Input
                      id="project_url"
                      type="url"
                      value={formData.project_url}
                      onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub URL</Label>
                    <Input
                      id="github_url"
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    <div className="font-medium">Featured Project</div>
                    <div className="text-sm text-muted-foreground">
                      Show as highlighted/showcase card on homepage
                    </div>
                  </Label>
                </div>

                {featuredCount >= 3 && !editingProject?.is_featured && formData.is_featured && (
                  <Alert>
                    <AlertDescription>
                      You already have {featuredCount} featured projects. Consider keeping only 1-2 featured for better focus.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No projects yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className={project.is_featured ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{project.title}</CardTitle>
                        {project.is_featured && (
                          <Star className="h-4 w-4 fill-primary text-primary" />
                        )}
                      </div>
                      <div 
                        className="text-sm text-muted-foreground mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                      />
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.split(',').map((tech, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeaturedMutation.mutate({
                          id: project.id,
                          is_featured: !project.is_featured
                        })}
                      >
                        {project.is_featured ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this project?')) {
                            deleteMutation.mutate(project.id);
                          }
                        }}
                      >
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
