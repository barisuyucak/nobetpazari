import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, Key } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string;
  student_number: string;
  university: string;
  phone_number: string;
}

const Profile = () => {
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchProfile();
    fetchMyShifts();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchMyShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyShifts(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet teklifleriniz yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Şifre sıfırlama bağlantısı e-mail adresinize gönderildi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Şifre sıfırlama e-maili gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Aktif', variant: 'default' as const },
      pending: { label: 'Beklemede', variant: 'secondary' as const },
      sold: { label: 'Satıldı', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Profilim</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                    <p className="text-lg">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Öğrenci Numarası</label>
                    <p className="text-lg">{profile.student_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Üniversite</label>
                    <p className="text-lg">{profile.university || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p className="text-lg">{profile.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                </>
              )}
              
              <Button 
                onClick={handleChangePassword}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Şifremi Değiştir
              </Button>
            </CardContent>
          </Card>

          {/* Past Offers */}
          <Card>
            <CardHeader>
              <CardTitle>Nöbet Tekliflerim ({myShifts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {myShifts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Henüz nöbet teklifiniz yok.</p>
                  <Button onClick={() => navigate('/create-shift')}>
                    İlk Teklifinizi Oluşturun
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myShifts.map((shift) => (
                    <div key={shift.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{shift.title}</h4>
                        <Badge variant={getStatusBadge(shift.status).variant}>
                          {getStatusBadge(shift.status).label}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(shift.shift_date)}</span>
                        </div>
                        
                        {shift.shift_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(shift.shift_time)}</span>
                          </div>
                        )}
                        
                        {shift.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-lg font-semibold text-primary">
                        {shift.price.toFixed(0)} TL
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;