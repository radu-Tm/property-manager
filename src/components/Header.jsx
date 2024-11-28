import React, { useState } from 'react';
import { Button } from './ui/button';
import { Building2, UserCircle, Menu, X } from 'lucide-react';

export const Header = ({ onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
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
            <Button 
              variant="ghost" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Meniu mobil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Proprietăți
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Contracte
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Plăți
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onSignOut}
            >
              <UserCircle className="h-5 w-5 mr-2" />
              Deconectare
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;