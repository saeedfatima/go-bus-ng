import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
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
import { toast } from 'sonner';
import { Users, Search, Shield, UserCheck, Building2, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type AppRole = 'admin' | 'company_admin' | 'passenger';

interface UserWithRoles {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  roles: AppRole[];
  bookingsCount?: number;
  companyName?: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const result = await api.profiles.getAll();
      return result.data.map((profile: any) => ({
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        createdAt: profile.createdAt,
        roles: profile.roles || [],
        bookingsCount: profile.bookingsCount,
        companyName: profile.companyName,
      } as UserWithRoles));
    }
  });

  // Calculate Stats
  const stats = users ? {
    total: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    companyAdmins: users.filter(u => u.roles.includes('company_admin')).length,
    passengers: users.filter(u => u.roles.includes('passenger')).length,
  } : null;

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      await api.userRoles.addRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add role');
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      await api.userRoles.removeRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove role');
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
                placeholder="Search by name, email or phone..."
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
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.fullName || 'No name'}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((role) => {
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
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.companyName || '-'}
                  </TableCell>
                  <TableCell>{u.bookingsCount}</TableCell>
                  <TableCell>
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(u)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        onValueChange={(role: AppRole) => {
                          if (!u.roles.includes(role)) {
                            addRoleMutation.mutate({ userId: u.id, role });
                          }
                        }}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin" disabled={u.roles.includes('admin')}>
                            Admin
                          </SelectItem>
                          <SelectItem value="company_admin" disabled={u.roles.includes('company_admin')}>
                            Company Admin
                          </SelectItem>
                          <SelectItem value="passenger" disabled={u.roles.includes('passenger')}>
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
            <DialogTitle>{selectedUser?.fullName || 'User Details'}</DialogTitle>
            <DialogDescription>
              Manage user roles and view activity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm truncate">{selectedUser?.email}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="font-medium">{selectedUser?.bookingsCount || 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Joined</p>
                <p className="font-medium">
                  {selectedUser && format(new Date(selectedUser.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

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
              </div>
              <p className="text-xs text-muted-foreground">Click a role to remove it</p>
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