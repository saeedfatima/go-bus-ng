import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Building2, Search, Eye, Bus, MapPin, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
  rating: number | null;
  total_trips: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface CompanyDetails extends Company {
  buses_count: number;
  routes_count: number;
  owner_name: string | null;
}

const AdminCompanies = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: companies, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Company[];
    },
  });

  // Get counts for stats
  const { data: stats } = useQuery({
    queryKey: ['admin-company-stats'],
    queryFn: async () => {
      const [
        { count: total },
        { count: verified },
        { count: pending }
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_verified', false),
      ]);
      return { total: total || 0, verified: verified || 0, pending: pending || 0 };
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ companyId, verified }: { companyId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: verified })
        .eq('id', companyId);
      if (error) throw error;
    },
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-company-stats'] });
      toast.success(verified ? 'Company verified successfully' : 'Company verification revoked');
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast.error('Failed to update company status');
    },
  });

  const fetchCompanyDetails = async (company: Company) => {
    const [
      { count: busesCount },
      { count: routesCount },
      { data: profile }
    ] = await Promise.all([
      supabase.from('buses').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
      supabase.from('routes').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
      supabase.from('profiles').select('full_name').eq('id', company.owner_id).single()
    ]);

    setSelectedCompany({
      ...company,
      buses_count: busesCount || 0,
      routes_count: routesCount || 0,
      owner_name: profile?.full_name || null
    });
    setIsDetailsOpen(true);
  };

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ? true :
      filterStatus === 'verified' ? company.is_verified :
      !company.is_verified;
    
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Verify and manage transport companies</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
            <XCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats?.pending}</div>
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
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: 'all' | 'verified' | 'pending') => setFilterStatus(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      {filteredCompanies && filteredCompanies.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Total Trips</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {company.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.is_verified ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      {company.rating?.toFixed(1) || '0.0'}
                    </div>
                  </TableCell>
                  <TableCell>{company.total_trips || 0}</TableCell>
                  <TableCell>
                    {format(new Date(company.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchCompanyDetails(company)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {company.is_verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verifyMutation.mutate({ companyId: company.id, verified: false })}
                          disabled={verifyMutation.isPending}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => verifyMutation.mutate({ companyId: company.id, verified: true })}
                          disabled={verifyMutation.isPending}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Companies will appear here when they register.'}
            </p>
          </div>
        </Card>
      )}

      {/* Company Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCompany?.logo_url ? (
                <img
                  src={selectedCompany.logo_url}
                  alt={selectedCompany.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany?.description || 'No description provided'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bus className="h-4 w-4" />
                  <span className="text-sm">Buses</span>
                </div>
                <p className="text-xl font-bold">{selectedCompany?.buses_count}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Routes</span>
                </div>
                <p className="text-xl font-bold">{selectedCompany?.routes_count}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <p className="text-xl font-bold">{selectedCompany?.rating?.toFixed(1) || '0.0'}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Owner</span>
                </div>
                <p className="text-sm font-medium truncate">{selectedCompany?.owner_name || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedCompany?.is_verified ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-sm font-medium">
                  {selectedCompany && format(new Date(selectedCompany.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {selectedCompany?.is_verified ? (
              <Button
                variant="destructive"
                onClick={() => verifyMutation.mutate({ companyId: selectedCompany.id, verified: false })}
                disabled={verifyMutation.isPending}
              >
                Revoke Verification
              </Button>
            ) : (
              <Button
                onClick={() => selectedCompany && verifyMutation.mutate({ companyId: selectedCompany.id, verified: true })}
                disabled={verifyMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Company
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanies;