'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { getCurrentUser } from "./api";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileEdit,
  FolderOpen,
  Tags,
  Users,
  LogOut,
  X,
  Menu,
  Settings,
  Image as ImageIcon,
  Users2,
  Package,
  Briefcase
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Create Post', href: '/admin/create', icon: FileEdit },
];

const adminNavigation = [
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Tags', href: '/admin/tags', icon: Tags },
  { name: 'Authors', href: '/admin/authors', icon: Users },
  { name: 'Teams', href: '/admin/teams', icon: Users2 },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Contact Messages', href: '/admin/contact-messages', icon: Settings },
  { name: 'Job Applications', href: '/admin/job-applications', icon: Briefcase }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  if (!mounted) {
    return null;
  }

  // For login page, just return children (root layout already handles header/footer)
  if (pathname === '/admin/login') {
    return (
      <ErrorBoundary>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  // For authenticated admin pages, redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-card border-r ">
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground text-black">Admin Panel</span>
        </Link>
        {/* Mobile sidebar close button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 text-black">
        <div className="space-y-1 ">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors  ${
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {userRole === 'admin' && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <Separator className="my-4" />
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {userRole === 'admin' ? 'Administrator' : 'Author'}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  // Admin pages layout
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex h-screen bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:w-64 md:flex-shrink-0">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="fixed left-0 top-0 bottom-0 w-64">
                <Sidebar />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b md:hidden bg-card">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold">Admin Panel</h1>
              <ThemeToggle />
            </div>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
