import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import UtilitatiForm from './UtilitatiForm';
import UtilitatiList from './UtilitatiList';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Bed, Bath, Square, ArrowRight, Search, SlidersHorizontal, Bell } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import AddPropertyForm from './AddPropertyForm';

const client = generateClient();

const listCladiri = /* GraphQL */ `
  query ListCladiri {
    listCladiri {
      items {
        id
        nume
      }
    }
  }
`;

const listProprietati = /* GraphQL */ `
  query ListProprietati {
    listProprietati {
      items {
        id
        nume
        tip
        adresa
        NumarCladire
        nivel
        dormitoare
        bai
        suprafata
        nota
        id_cladire
      }
    }
  }
`;

const PROPERTY_TYPES = ['Toate', 'Apartament', 'Casă', 'Comercial'];

const PropertyCard = ({ proprietate }) => {
  const navigate = useNavigate();
  
  const formatNumber = (number) => {
    if (number === null || number === undefined) return '';
    return typeof number === 'number' ? number.toFixed(2) : number;
  };

  return (
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
            <span>{formatNumber(proprietate.suprafata)} m²</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/property/${proprietate.id}`)}
        >
          Vezi detalii
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

const ProprietarDashboard = () => {
  const [proprietati, setProprietati] = useState([]);
  const [filteredProprietati, setFilteredProprietati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Toate');
  const [sortBy, setSortBy] = useState('nume');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [cladiri, setCladiri] = useState([]);
  const [selectedCladire, setSelectedCladire] = useState(null);
  const [selectedLuna, setSelectedLuna] = useState(new Date().toISOString().slice(0, 7));
  const [showNotifications, setShowNotifications] = useState(false);

  const handleCladireChange = (e) => {
    setSelectedCladire(e.target.value);
    fetchProprietati();
  };

  const fetchCladiri = async () => {
    try {
      const result = await client.graphql({
        query: listCladiri
      });
      setCladiri(result.data.listCladiri.items);
    } catch (error) {
      console.error('Error fetching cladiri:', error.errors?.[0]?.message || error);
    }
  };

  const fetchProprietati = async () => {
    try {
      setLoading(true);
      const result = await client.graphql({
        query: listProprietati
      });
      const items = result.data.listProprietati.items;
      setProprietati(items);
      setFilteredProprietati(items);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCladiri();
  }, []);

  useEffect(() => {
    fetchProprietati();
  }, [selectedCladire]);

  useEffect(() => {
    let filtered = [...proprietati];

    if (selectedCladire) {
      filtered = filtered.filter(prop => prop.id_cladire === selectedCladire);
    }

    filtered = filtered.filter(prop => {
      const matchesSearch = !searchTerm || 
        prop.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.adresa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'Toate' || prop.tip === selectedType;
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'nume') {
        return a.nume.localeCompare(b.nume);
      } else if (sortBy === 'suprafata') {
        return (b.suprafata || 0) - (a.suprafata || 0);
      }
      return 0;
    });

    setFilteredProprietati(filtered);
  }, [proprietati, selectedCladire, searchTerm, selectedType, sortBy]);

  return (
    <div className="p-8">
      {/* Buton Notificări */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="rounded-full p-3"
        >
          <Bell className="h-6 w-6" />
        </Button>
      </div>

      {/* Panel Notificări */}
      {showNotifications && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" 
             style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <NotificationsPanel />
        </div>
      )}

      {/* Header și Căutare */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Proprietățile Mele</h1>
          <Button onClick={() => setShowAddForm(true)}>
            Adaugă Proprietate
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Caută după nume sau adresă..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCladire || ''}
            onChange={handleCladireChange}
            className="p-2 border rounded min-w-[200px]"
          >
            <option value="">Toate clădirile</option>
            {cladiri.map(cladire => (
              <option key={cladire.id} value={cladire.id}>{cladire.nume}</option>
            ))}
          </select>
        </div>

        {/* Filtre */}
        <Button 
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtre
        </Button>

        {showFilters && (
          <div className="mb-4 flex gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tip Proprietate</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full p-2 border rounded-md"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sortare</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full p-2 border rounded-md"
              >
                <option value="nume">Nume</option>
                <option value="suprafata">Suprafață (desc)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista Proprietăți */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            filteredProprietati.map((prop) => (
              <PropertyCard key={prop.id} proprietate={prop} />
            ))
          )}
          {!loading && filteredProprietati.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              Nu s-au găsit proprietăți care să corespundă criteriilor de căutare.
            </div>
          )}
        </div>
      </div>

      {/* Gestiune Utilități */}
      {selectedCladire && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Gestiune Utilități</h2>
          <div className="flex items-center mb-4">
            <input
              type="month"
              value={selectedLuna}
              onChange={(e) => setSelectedLuna(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <UtilitatiForm id_cladire={selectedCladire} luna={selectedLuna} />
            <UtilitatiList id_cladire={selectedCladire} luna={selectedLuna} />
          </div>
        </div>
      )}

      {/* Modal Adăugare Proprietate */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex justify-center items-start min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl mt-8 relative">
              <AddPropertyForm 
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchProprietati();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProprietarDashboard;