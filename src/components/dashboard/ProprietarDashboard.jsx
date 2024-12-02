import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import UtilitatiForm from './UtilitatiForm';
import UtilitatiList from './UtilitatiList';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Bed, Bath, Square, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

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
  const [selectedLuna, setSelectedLuna] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handleCladireChange = (e) => {
  setSelectedCladire(e.target.value);
  fetchProprietati(); // Reîncărcăm proprietățile
};

 const fetchCladiri = async () => {
  try {
    const result = await client.graphql({
      query: listCladiri
    });
    console.log('Rezultat listCladiri:', result);
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
    //console.log('Proprietati primite:', result.data.listProprietati.items);
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

// Al doilea efect pentru încărcarea proprietăților - adăugăm selectedCladire ca dependență
useEffect(() => {
  fetchProprietati();
}, [selectedCladire]); // Se va executa când se schimbă clădirea selectată

// Al treilea efect pentru filtrare
useEffect(() => {
  let filtered = [...proprietati];

  // Filtrăm după clădirea selectată
  if (selectedCladire) {
    filtered = filtered.filter(prop => prop.id_cladire === selectedCladire);
  }

  // Restul filtrărilor existente
  filtered = filtered.filter(prop => {
    const matchesSearch = !searchTerm || 
      prop.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.adresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Toate' || prop.tip === selectedType;
    return matchesSearch && matchesType;
  });

  // Sortarea existentă
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
    <div className="mb-6 min-h-[400px]">
      <NotificationsPanel />
    </div>

    {/* Secțiunea de utilități - adăugăm înălțime minimă */}
    <div className="mb-8 min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestiune Utilități</h2>
        <div className="flex gap-4">
          <select
  value={selectedCladire || ''}
  onChange={(e) => setSelectedCladire(e.target.value)}
  className="p-2 border rounded min-w-[200px]"
>
  <option value="">Toate clădirile</option>
  {cladiri.map(cladire => (
    <option key={cladire.id} value={cladire.id}>{cladire.nume}</option>
  ))}
</select>
          
          <input
            type="month"
            value={selectedLuna}
            onChange={(e) => setSelectedLuna(e.target.value)}
            className="p-2 border rounded min-w-[150px]" // Adăugăm lățime minimă
          />
        </div>
      </div>

      {selectedCladire && (
        <div className="grid md:grid-cols-2 gap-6 min-h-[300px]">
          <UtilitatiForm id_cladire={selectedCladire} luna={selectedLuna} />
          <UtilitatiList id_cladire={selectedCladire} luna={selectedLuna} />
        </div>
      )}
    </div>	  
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Proprietățile Mele</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtre
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              Adaugă Proprietate
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Caută după nume sau adresă..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
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
  );
};

export default ProprietarDashboard;