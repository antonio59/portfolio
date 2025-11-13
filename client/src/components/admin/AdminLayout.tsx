/**
 * Admin Layout with Navigation
 */

import { Link, useLocation } from 'wouter';
import { adminAuth } from '@/lib/admin-auth';
import { 
  LayoutDashboard, FileText, User, Briefcase, 
  Award, MessageSquare, LogOut, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const admin = adminAuth.getCurrentAdmin();

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  const handleLogout = () => {
    adminAuth.logout();
    setLocation('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/blog', icon: FileText, label: 'Blog Posts' },
    { href: '/admin/profile', icon: User, label: 'Profile' },
    { href: '/admin/projects', icon: Briefcase, label: 'Projects' },
    { href: '/admin/certifications', icon: Award, label: 'Certifications' },
  ];

  if (!adminAuth.isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground mt-1">{admin?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
