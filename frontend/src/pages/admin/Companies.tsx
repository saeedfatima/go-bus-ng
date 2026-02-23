import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
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
import { CheckCircle, XCircle, Building2, Search, Eye, Bus, MapPin, Users, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ApiCompany, ApiProfile, ApiBus, ApiRoute } from '@/services/api/types';

interface CompanyDetails extends ApiCompany {
  busesCount: number;
  routesCount: number;
  ownerName: string | null;
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
      const result = await api.companies.getAll();
      return result.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ companyId, verified }: { companyId: string; verified: boolean }) => {
      return await api.companies.update(companyId, { isVerified: verified });
    },
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast.success(verified ? 'Company verified' : 'Verification revoked');
      setIsDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const fetchCompanyDetails = async (company: ApiCompany) => {
    try {
      const [buses, routes, profile] = await Promise.all([
        api.buses.getByCompanyId(company.id),
        api.routes.getByCompanyId(company.id),
        api.profiles.getById(company.ownerId)
      ]);

      setSelectedCompany({
        ...company,
        busesCount: buses.length,
        routesCount: routes.length,
        ownerName: profile?.fullName || 'Unknown'
      });
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error('Failed to load company details');
    }
  };

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ? true :
      filterStatus === 'verified' ? company.isVerified :
      !company.isVerified;
    
    return matchesSearch && matchesFilter;
  });

  const stats = companies ? {
    total: companies.length,
    verified: companies.filter(c => c.isVerified).length,
    pending: companies.filter(c => !c.isVerified).length
  } : null;

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <XCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats?.pending}</div>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies?.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {company.logoUrl ? (
                         <img src={company.logoUrl} alt="" className="object-cover h-full w-full" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{company.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {company.isVerified ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>{company.totalTrips}</TableCell>
                <TableCell>{format(new Date(company.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => fetchCompanyDetails(company)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={company.isVerified ? "outline" : "default"}
                      size="sm"
                      onClick={() => verifyMutation.mutate({ companyId: company.id, verified: !company.isVerified })}
                    >
                      {company.isVerified ? 'Revoke' : 'Verify'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCompany?.name}</DialogTitle>
            <DialogDescription>{selectedCompany?.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground block">Buses</span>
              <span className="font-bold">{selectedCompany?.busesCount}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground block">Routes</span>
              <span className="font-bold">{selectedCompany?.routesCount}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg col-span-2">
              <span className="text-xs text-muted-foreground block">Owner</span>
              <span className="font-medium">{selectedCompany?.ownerName || 'Unknown'}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            <Button 
              variant={selectedCompany?.isVerified ? "destructive" : "default"}
              onClick={() => selectedCompany && verifyMutation.mutate({ companyId: selectedCompany.id, verified: !selectedCompany.isVerified })}
            >
              {selectedCompany?.isVerified ? 'Revoke Verification' : 'Verify Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanies;