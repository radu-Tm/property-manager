import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { AuthComponent } from './components/auth/AuthComponent';
import ProprietarDashboard from './components/dashboard/ProprietarDashboard';
import ChiriasDashboard from './components/dashboard/ChiriasDashboard';
import PropertyDetails from './components/dashboard/PropertyDetails';
import Contracte from './components/dashboard/Contracte';
import Plati from './components/dashboard/Plati';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from "./components/ui/toaster";


const AppContent = () => {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
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
        <Routes>
          <Route path="/" element={
            user.userType === 'proprietar' ? (
              <ProprietarDashboard />
            ) : (
              <ChiriasDashboard />
            )
          } />
          <Route path="/property/:id" element={<PropertyDetails />} />
		  <Route path="/contracte" element={<Contracte />} />
		  <Route path="/plati" element={<Plati />} />
		</Routes>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);

export default App;