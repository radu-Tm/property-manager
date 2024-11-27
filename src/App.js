import React from 'react';
import { signOut } from 'aws-amplify/auth';
import { AuthComponent } from './components/auth/AuthComponent';
import { Button } from './components/ui/button';
import { Building2, UserCircle, Menu } from 'lucide-react';
import ProprietarDashboard from './components/dashboard/ProprietarDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import ChiriasDashboard from './components/dashboard/ChiriasDashboard';

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
const handleSignOut = async () => {
  try {
    await signOut();
    window.location.reload(); // Forțăm refresh după logout
  } catch (error) {
    console.error('Error signing out: ', error);
  }
};
const AppContent = () => {
  const { user, loading, checkAuth } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut({ global: true }); // am adăugat global: true
      window.location.reload(); // forțăm refresh după logout
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

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSignOut={handleSignOut} />
      <main>
        {user.userType === 'proprietar' ? (
          <ProprietarDashboard />
        ) : (
          <ChiriasDashboard />
        )}
      </main>
    </div>
  );
};

// Wrapper component pentru AuthProvider
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;