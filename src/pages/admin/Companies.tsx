import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminCompanies = () => {
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
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
      toast.success(verified ? 'Company verified successfully' : 'Company verification revoked');
    },
    onError: () => {
      toast.error('Failed to update company status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Verify and manage transport companies</p>
        </div>
      </div>

      {companies && companies.length > 0 ? (
        <div className="bg-card rounded-lg border">
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
              {companies.map((company) => (
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
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{company.rating?.toFixed(1) || '0.0'}</TableCell>
                  <TableCell>{company.total_trips || 0}</TableCell>
                  <TableCell>
                    {format(new Date(company.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {company.is_verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          verifyMutation.mutate({ companyId: company.id, verified: false })
                        }
                        disabled={verifyMutation.isPending}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          verifyMutation.mutate({ companyId: company.id, verified: true })
                        }
                        disabled={verifyMutation.isPending}
                      >
                        Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No companies yet</h3>
          <p className="text-muted-foreground">
            Companies will appear here when they register.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
