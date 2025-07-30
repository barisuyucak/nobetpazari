import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, ShoppingCart, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Nöbet Pazarı</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profil
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Hoş Geldiniz!</h2>
          <p className="text-muted-foreground">Ne yapmak istiyorsunuz?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-shift')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Nöbetimi Satmak İstiyorum</CardTitle>
              <CardDescription>
                Nöbet teklifinizi oluşturun ve diğer doktorlara satın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Nöbet Teklifi Oluştur
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/shift-offers')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Nöbet Satın Almak İstiyorum</CardTitle>
              <CardDescription>
                Mevcut nöbet tekliflerine göz atın ve satın alın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                Nöbet Tekliflerini Gör
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;