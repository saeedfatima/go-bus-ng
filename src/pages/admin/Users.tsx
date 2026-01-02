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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Shield, UserCheck, Building2, Ticket, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

type AppRole = 'admin' | 'company_admin' | 'passenger';

interface UserWithRoles {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
  bookings_count?: number;
  company_name?: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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

      // Get roles and additional info for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [
            { data: roles },
            { count: bookingsCount },
            { data: company }
          ] = await Promise.all([
            supabase.from('user_roles').select('role').eq('user_id', profile.id),
            supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
            supabase.from('companies').select('name').eq('owner_id', profile.id).maybeSingle()
          ]);

          return {
            ...profile,
            roles: (roles?.map(r => r.role) || []) as AppRole[],
            bookings_count: bookingsCount || 0,
            company_name: company?.name || null
          };
        })
      );

      return usersWithRoles;
    }
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data: allRoles } = await supabase.from('user_roles').select('role');
      
      const admins = allRoles?.filter(r => r.role === 'admin').length || 0;
      const companyAdmins = allRoles?.filter(r => r.role === 'company_admin').length || 0;
      const passengers = allRoles?.filter(r => r.role === 'passenger').length || 0;
      
      return { total: users?.length || 0, admins, companyAdmins, passengers };
    },
    enabled: !!users
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
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
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
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

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    
    const matchesRole = roleFilter === 'all' ? true : user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'admin': 
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'company_admin': 
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: 
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'company_admin': return Building2;
      default: return UserCheck;
    }
  };

  const viewUserDetails = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <Shield className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.admins || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Company Admins</CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats?.companyAdmins || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Passengers</CardTitle>
            <UserCheck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats?.passengers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v: 'all' | AppRole) => setRoleFilter(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="company_admin">Company Admins</SelectItem>
                <SelectItem value="passenger">Passengers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Bookings</TableHead>
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
                      {user.roles.map((role) => {
                        const Icon = getRoleIcon(role);
                        return (
                          <Badge 
                            key={role} 
                            className={`${getRoleBadgeStyles(role)} flex items-center gap-1`}
                          >
                            <Icon className="h-3 w-3" />
                            {role.replace('_', ' ')}
                          </Badge>
                        );
                      })}
                      {user.roles.length === 0 && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No roles
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.company_name || '-'}
                  </TableCell>
                  <TableCell>{user.bookings_count}</TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        onValueChange={(role: AppRole) => {
                          if (!user.roles.includes(role)) {
                            addRoleMutation.mutate({ userId: user.id, role });
                          }
                        }}
                      >
                        <SelectTrigger className="w-28 h-8">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser?.full_name || 'User Details'}</DialogTitle>
            <DialogDescription>
              Manage user roles and view activity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedUser?.phone || 'Not provided'}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="font-medium">{selectedUser?.bookings_count || 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Joined</p>
                <p className="font-medium">
                  {selectedUser && format(new Date(selectedUser.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {selectedUser?.company_name && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-500 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Company Owner</span>
                </div>
                <p className="font-medium">{selectedUser.company_name}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Current Roles</p>
              <div className="flex flex-wrap gap-2">
                {selectedUser?.roles.map((role) => {
                  const Icon = getRoleIcon(role);
                  return (
                    <Badge 
                      key={role} 
                      className={`${getRoleBadgeStyles(role)} flex items-center gap-1 cursor-pointer hover:opacity-80`}
                      onClick={() => {
                        if (confirm(`Remove ${role.replace('_', ' ')} role from this user?`)) {
                          removeRoleMutation.mutate({ userId: selectedUser.id, role });
                        }
                      }}
                    >
                      <Icon className="h-3 w-3" />
                      {role.replace('_', ' ')}
                      <span className="ml-1 opacity-60">×</span>
                    </Badge>
                  );
                })}
                {selectedUser?.roles.length === 0 && (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Click a role to remove it</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Add Role</p>
              <div className="flex gap-2">
                {(['admin', 'company_admin', 'passenger'] as AppRole[]).map((role) => {
                  const isDisabled = selectedUser?.roles.includes(role);
                  const Icon = getRoleIcon(role);
                  return (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      disabled={isDisabled || addRoleMutation.isPending}
                      onClick={() => selectedUser && addRoleMutation.mutate({ userId: selectedUser.id, role })}
                      className={isDisabled ? 'opacity-50' : ''}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {role.replace('_', ' ')}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;