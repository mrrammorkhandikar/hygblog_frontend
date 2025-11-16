'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'author'>('admin');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setIsLoading(true);

    try {
      const data = await apiPost<{ token: string; role: string }>('/auth/login', null, { username, password, role });
      // Save token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminToken', data.token);
        // Redirect and reload to ensure authentication state is updated
        window.location.href = '/admin/dashboard';
      }
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-black">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center text-black">
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="space-y-2 text-black">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'author')}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'author', label: 'Author' }
                ]}
              />
            </div>

            <div className="space-y-2 text-black">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 text-black">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {err && (
              <div className="flex items-center space-x-2 text-sm text-destructive ">
                <AlertCircle className="h-4 w-4" />
                <span>{err}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
