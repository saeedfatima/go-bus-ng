import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Shield, CheckCircle } from 'lucide-react';

interface DashboardContext {
  company: {
    id: string;
    name: string;
    description: string | null;
    is_verified: boolean;
    rating: number;
    total_trips: number;
  };
}

const SettingsPage = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company?.name || '',
    description: company?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('companies')
      .update({
        name: formData.name,
        description: formData.description,
      })
      .eq('id', company.id);

    if (error) {
      toast.error('Failed to update company: ' + error.message);
    } else {
      toast.success('Company updated successfully!');
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Company Settings</h2>
        <p className="text-muted-foreground">Manage your company profile and settings</p>
      </div>

      {/* Company Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
          <CardDescription>
            Your company's verification status and rating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {company?.is_verified ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {company?.is_verified ? 'Verified Company' : 'Pending Verification'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {company?.is_verified
                    ? 'Your company has been verified by NaijaBus'
                    : 'Your company is under review'}
                </p>
              </div>
            </div>
            <Badge variant={company?.is_verified ? 'default' : 'secondary'}>
              {company?.is_verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold text-foreground">
                {company?.rating || 0} ★
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-2xl font-bold text-foreground">
                {company?.total_trips || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
          <CardDescription>
            Update your company's public information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell passengers about your transport company..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
