import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { AuthComponent } from './components/auth/AuthComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Building2, UserCircle, Menu, Bed, Bath, Square, ArrowRight } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
// Header Component
const Header = ({ onSignOut }) => (
  <div className="w-full bg-white border-b shadow-sm">
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold">PropManager</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost">Proprietăți</Button>
          <Button variant="ghost">Contracte</Button>
          <Button variant="ghost">Plăți</Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden md:flex" onClick={onSignOut}>
            <UserCircle className="h-5 w-5 mr-2" />
            Deconectare
          </Button>
          <Button variant="ghost" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// PropertyCard Component
const PropertyCard = ({ proprietate }) => (
  <Card className="w-full hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Building2 className="h-5 w-5 text-blue-600" />
        <span>{proprietate.nume}</span>
      </CardTitle>
      <CardDescription>{proprietate.adresa}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Bed className="h-4 w-4 text-gray-500" />
          <span>{proprietate.dormitoare} dormitoare</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bath className="h-4 w-4 text-gray-500" />
          <span>{proprietate.bai} băi</span>
        </div>
        <div className="flex items-center space-x-2">
          <Square className="h-4 w-4 text-gray-500" />
          <span>{proprietate.suprafata} m²</span>
        </div>
      </div>
      <Button variant="outline" className="w-full">
        Vezi detalii
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </CardContent>
  </Card>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proprietati, setProprietati] = useState([]);

  useEffect(() => {
    checkAuthState();
    if (isAuthenticated) {
      fetchProprietati();
    }
  }, [isAuthenticated]);

  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchProprietati = async () => {
    // Date mock pentru exemplu
    const mockData = [
      {
        id: '1',
        nume: 'Proprietate 1',
        tip: 'Casă',
        adresa: 'Str. Exemplu 1, nr. 10, București',
        dormitoare: 4,
        bai: 3,
        suprafata: 120.5
      },
      {
        id: '2',
        nume: 'Proprietate 2',
        tip: 'Apartament',
        adresa: 'Str. Exemplu 2, nr. 20, București',
        dormitoare: 3,
        bai: 2,
        suprafata: 75.3
      },
      {
        id: '3',
        nume: 'Proprietate 3',
        tip: 'Comercial',
        adresa: 'Str. Exemplu 3, nr. 30, București',
        dormitoare: 0,
        bai: 1,
        suprafata: 250
      }
    ];

    setProprietati(mockData);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthComponent onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignOut={handleSignOut} />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proprietati.map((proprietate) => (
              <PropertyCard key={proprietate.id} proprietate={proprietate} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;