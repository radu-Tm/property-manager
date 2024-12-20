import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Bed, Bath, Square, ArrowRight, Search, SlidersHorizontal, Bell, CreditCard, ArrowUp, HandCoins, KeyRound } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import AddPropertyForm from './AddPropertyForm';
import FisaUtilitati from './FisaUtilitati';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const client = generateClient();

const listCladiri = /* GraphQL */ `
  query ListCladiri($email: String!) {
    listCladiri(email: $email) {
      items {
        id
        nume
      }
    }
  }
`;

const listProprietati = `
  query ListProprietati($email: String!) {
    listProprietati(email: $email) {
      items {
        id
        nume
        tip
        releveu
        adresa
        nivel
        bai
        suprafata
        nota
        id_cladire
        contracte {
          ChirieInitiala
          chirias {
            nume
          }
          restanta {
            chirie {
              suma_totala
              suma_platita
              rest_plata
            }
            utilitati {
              suma_totala
              suma_platita
              rest_plata
            }
          }
        }
      }
    }
  }
`;

const createPlata = /* GraphQL */ `
 mutation CreatePlata($input: CreatePlataInput!) {
   createPlata(input: $input) {
     id
     data_plata
     suma
     tip
     metoda_plata
     numar_document
     luna_platita
     nota
   }
 }
`;

const getFacturiSiCoteParts = /* GraphQL */ `
  query GetFacturiSiCoteParts($luna: String!) {
    getFacturiSiCoteParts(luna: $luna) {
      tip
      numar_factura
      data_factura
      suma
      perioada_start
      perioada_end
      cote_parti {
        chirias_nume
        suprafata
        numar_persoane
        suprafata_totala
        total_persoane
        suma
        mod_calcul
      }
    }
  }
`;

const PROPERTY_TYPES = ['Toate', 'Apartament', 'Casă', 'Comercial'];

const PropertyCard = ({ proprietate }) => {
  const contractActiv = proprietate.contracte?.[0];
  const navigate = useNavigate();
  const formatNumber = (number) => {
    if (number === null || number === undefined) return '';
    return typeof number === 'number' ? number.toFixed(2) : number;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <KeyRound className="h-5 w-5 text-green-600" />
          {contractActiv?.chirias && (
            <p className="text-gray-600 mt-1">
              {contractActiv.chirias.nume}
            </p>
          )}
          {!contractActiv?.chirias && (
            <p className="text-gray-600 mt-1">
              Spaţiu Gol
            </p>
          )}
        </CardTitle>
        <div className="flex justify-between text-sm text-gray-500">
          <div>{proprietate.nume}</div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-green-500" />
            <small>Chirie {formatNumber(contractActiv?.ChirieInitiala || 0)} EUR</small>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 mb-4">
       {contractActiv?.restanta?.chirie?.rest_plata > 0 && (
  <div className="flex items-center text-red-600 space-x-2">
    <HandCoins className="h-4 w-4 text-red-400" />   
    <small>Restanțe chirie: {formatNumber(contractActiv.restanta.chirie.rest_plata)} EUR</small>
  </div>
)}
{contractActiv?.restanta?.utilitati?.rest_plata > 0 && (
  <div className="flex items-center text-red-600 space-x-2">
    <HandCoins className="h-4 w-4 text-red-400" />   
    <small>Restanțe utilități: {formatNumber(contractActiv.restanta.utilitati.rest_plata)} RON</small>
  </div>
)}
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

const GenerareRaportUtilitati = () => {
  const [lunaSelectata, setLunaSelectata] = useState(new Date().toISOString().slice(0, 7));
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const generatePDF = (data) => {
    // Grupăm facturile după tip
       const tables = data.map(factura => ({
        title: factura.tip,
        header: [
            'Chiriaș',
            factura.tip === 'GAZ' || factura.tip === 'ENERGIE' ? 'Suprafață' : 'Nr. Persoane',
            factura.tip === 'GAZ' || factura.tip === 'ENERGIE' ? 'Suprafață Totală' : 'Total Persoane',
            'Valoare Totală',
            'Cotă Parte'
        ],
        rows: [
            ...factura.cote_parti.map(cp => [
                cp.chirias_nume,
                cp.mod_calcul === 'suprafata' ? cp.suprafata.toString() : cp.numar_persoane.toString(),
                cp.mod_calcul === 'suprafata' ? cp.suprafata_totala.toString() : cp.total_persoane.toString(),
                factura.suma.toFixed(2),
                cp.suma.toFixed(2)
            ]),
            [
                'Total',
                '',
                factura.cote_parti[0]?.mod_calcul === 'suprafata' ? 
                    factura.cote_parti[0]?.suprafata_totala.toString() : 
                    factura.cote_parti[0]?.total_persoane.toString(),
                factura.suma.toFixed(2),
                factura.cote_parti.reduce((sum, cp) => sum + cp.suma, 0).toFixed(2)
            ]
        ]
    }));

    const docDefinition = {
        content: [
            {
                text: `Situație utilități - ${lunaSelectata}`,
                style: 'header',
                margin: [0, 0, 0, 20]
            },
            ...tables.map(table => [
                { text: table.title, style: 'subheader', margin: [0, 10, 0, 5] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            table.header,
                            ...table.rows
                        ]
                    },
                    margin: [0, 0, 0, 20]
                }
            ])
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 14,
                bold: true,
                margin: [0, 0, 0, 5]
            }
        }
    };
    pdfMake.createPdf(docDefinition).download(`Raport_Utilitati_${lunaSelectata}.pdf`);
  };

  const handleGenerare = async () => {
    setLoading(true);
    try {
      const result = await client.graphql({
        query: getFacturiSiCoteParts,
        variables: { luna: lunaSelectata }
      });
      
      generatePDF(result.data.getFacturiSiCoteParts);
      showSuccess('Raport generat cu succes');
    } catch (error) {
      console.error('Error:', error);
      showError('Eroare la generarea raportului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="month"
        value={lunaSelectata}
        onChange={(e) => setLunaSelectata(e.target.value)}
        className="border rounded p-2"
      />
      <Button 
        onClick={handleGenerare}
        disabled={loading}
      >
        {loading ? 'Generare...' : 'Generează Raport Utilități'}
      </Button>
    </div>
  );
};

const ProprietarDashboard = () => {
	const { user } = useAuth(); 
	//console.log(user.email);
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

const fetchProprietati = async () => {
  try {
    setLoading(true);  // Înainte de fetch
    //console.log('Fetching properties for email:', user.email);
    const response = await client.graphql({
      query: listProprietati,
      variables: { email: user.email }
    });
    //console.log('Full GraphQL response:', JSON.stringify(response, null, 2));
    
    if (response.data?.listProprietati?.items) {
      setProprietati(response.data.listProprietati.items);
      setFilteredProprietati(response.data.listProprietati.items);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
  } finally {
    setLoading(false);  // Important: trebuie să fie în finally
  }
};

const fetchCladiri = async () => {
  try {
    //console.log('User email in fetchCladiri:', user.email);
    const response = await client.graphql({
      query: listCladiri,
      variables: { email: user.email }
    });
    //console.log('GraphQL response cladiri:', response);
    setCladiri(response.data.listCladiri.items);
  } catch (error) {
    console.error('Error fetching cladiri:', error);
  }
};
// PlataForm.jsx
const AdaugaPlataForm = ({ contract, onSuccess }) => {
  const [formData, setFormData] = useState({
    data_plata: new Date().toISOString().split('T')[0],
    suma: '',
    tip: 'CHIRIE',
    metoda_plata: 'TRANSFER',
    numar_document: '',
    luna_platita: new Date().toISOString().slice(0, 7),
    nota: ''
  });

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.graphql({
        query: createPlata,
        variables: {
          input: {
            ...formData,
            id_contract: contract.id,
            suma: parseFloat(formData.suma)
          }
        }
      });

      showSuccess('Plata a fost înregistrată cu succes');
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      showError('Eroare la înregistrarea plății');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data Plată*</label>
          <input
            type="date"
            value={formData.data_plata}
            onChange={(e) => setFormData({...formData, data_plata: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sumă*</label>
          <input
            type="number"
            step="0.01"
            value={formData.suma}
            onChange={(e) => setFormData({...formData, suma: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tip Plată*</label>
          <select
            value={formData.tip}
            onChange={(e) => setFormData({...formData, tip: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="CHIRIE">Chirie</option>
            <option value="UTILITATI">Utilități</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Metodă Plată*</label>
          <select
            value={formData.metoda_plata}
            onChange={(e) => setFormData({...formData, metoda_plata: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="TRANSFER">Transfer Bancar</option>
            <option value="NUMERAR">Numerar</option>
            <option value="CARD">Card</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Număr Document</label>
          <input
            type="text"
            value={formData.numar_document}
            onChange={(e) => setFormData({...formData, numar_document: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Luna Plătită*</label>
          <input
            type="month"
            value={formData.luna_platita}
            onChange={(e) => setFormData({...formData, luna_platita: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notă</label>
          <textarea
            value={formData.nota}
            onChange={(e) => setFormData({...formData, nota: e.target.value})}
            className="w-full p-2 border rounded"
            rows="2"
          />
        </div>
      </div>

      <Button 
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Se înregistrează...' : 'Înregistrează Plata'}
      </Button>
    </form>
  );
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
		  <div className="flex gap-4">
      <GenerareRaportUtilitati />
      <Button onClick={() => setShowAddForm(true)}>
        Adaugă Proprietate
      </Button>
    </div>
         
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

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Facturi și Utilități</h2>
        <FisaUtilitati />
      </div>
	  

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