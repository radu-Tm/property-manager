import React, { useState } from 'react';
import { Button } from './ui/button';
import { Building2, UserCircle, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../font.css';
export const Header = ({ onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const navigate = useNavigate();

  const handleClick = () => {
    navigate('/'); // Redirecționează la Homepage
  };
  return (
    <div className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div onClick={handleClick} className="flex items-center space-x-2" style={{ cursor: 'pointer' }}>
          <div id="bila" className="rotate-on-load"><svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="60" height="60"><defs><image  width="73" height="102" id="img1" href="data:image/png;base64,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"/></defs><style></style><use  href="#img1" x="18" y="5"/></svg>
            </div><span className="pmgr">PropManager</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-gray-500">
            <Button onClick={handleClick} variant="ghost">Proprietăți</Button>
            <Button variant="ghost"  onClick={() => navigate(`/contracte`)}>Contracte</Button>
            <Button variant="ghost" onClick={() => navigate(`/plati`)}>Plăți</Button>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500">
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
            <Button onClick={() => {setIsMobileMenuOpen(false); navigate(`/`)}} variant="ghost" className="w-full justify-start">
              Proprietăți
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {setIsMobileMenuOpen(false); navigate(`/contracte`)}}>
              Contracte
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {setIsMobileMenuOpen(false);navigate(`/plati`)}}>
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