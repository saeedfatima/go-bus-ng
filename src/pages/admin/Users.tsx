import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Shield, UserCheck, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: roles?.map(r => r.role) || []
          };
        })
      );

      return usersWithRoles;
    }
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'company_admin' | 'passenger' }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role added successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add role', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'company_admin' | 'passenger' }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role removed successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove role', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'company_admin': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'company_admin': return Building2;
      default: return UserCheck;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span>{users?.length || 0} users</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'No name'}
                  </TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role: 'admin' | 'company_admin' | 'passenger') => {
                        const Icon = getRoleIcon(role);
                        return (
                          <Badge 
                            key={role} 
                            variant={getRoleBadgeVariant(role)}
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => {
                              if (confirm(`Remove ${role} role from this user?`)) {
                                removeRoleMutation.mutate({ userId: user.id, role });
                              }
                            }}
                          >
                            <Icon className="h-3 w-3" />
                            {role}
                          </Badge>
                        );
                      })}
                      {user.roles.length === 0 && (
                        <span className="text-muted-foreground text-sm">No roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(role: 'admin' | 'company_admin' | 'passenger') => {
                        if (!user.roles.includes(role)) {
                          addRoleMutation.mutate({ userId: user.id, role });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin" disabled={user.roles.includes('admin')}>
                          Admin
                        </SelectItem>
                        <SelectItem value="company_admin" disabled={user.roles.includes('company_admin')}>
                          Company Admin
                        </SelectItem>
                        <SelectItem value="passenger" disabled={user.roles.includes('passenger')}>
                          Passenger
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
