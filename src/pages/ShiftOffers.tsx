import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, TrendingUp } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  description: string;
  price: number;
  shift_date: string;
  shift_time: string | null;
  location: string | null;
  status: string;
  seller_id: string;
  created_at: string;
}

const ShiftOffers = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShifts(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet teklifleri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ 
          buyer_id: user.id,
          status: 'pending'
        })
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Nöbet teklifi kabul edildi. Satıcı ile iletişime geçebilirsiniz.",
      });

      fetchShifts(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Nöbet satın alınırken bir hata oluştu.",
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
    return timeString.slice(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Nöbet teklifleri yükleniyor...</p>
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
          <h1 className="text-2xl font-bold text-foreground">Nöbet Teklifleri</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {shifts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz nöbet teklifi yok</h3>
            <p className="text-muted-foreground mb-6">İlk nöbet teklifini siz oluşturun!</p>
            <Button onClick={() => navigate('/create-shift')}>
              Nöbet Teklifi Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <Card key={shift.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{shift.title}</CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {shift.price.toFixed(0)} TL
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {shift.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(shift.shift_date)}</span>
                    </div>
                    
                    {shift.shift_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(shift.shift_time)}</span>
                      </div>
                    )}
                    
                    {shift.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{shift.location}</span>
                      </div>
                    )}
                  </div>

                  {shift.seller_id !== user.id && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleBuyShift(shift.id)}
                    >
                      Nöbeti Satın Al
                    </Button>
                  )}
                  
                  {shift.seller_id === user.id && (
                    <Badge variant="outline" className="w-full justify-center">
                      Sizin teklifiniz
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShiftOffers;