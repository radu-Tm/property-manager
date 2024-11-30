import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';
import AddChiriasForm from './AddChiriasForm';

const client = generateClient();

// Mutăm query-urile în afara componentei
const listChiriasi = /* GraphQL */ `
  query ListChiriasi {
    listChiriasi {
      items {
        id
        nume
        email
      }
    }
  }
`;

const createContract = /* GraphQL */ `
  mutation CreateContract(
    $input: CreateContractInput!
  ) {
    createContract(input: $input) {
      id
      numar_contract
      IDProprietate
      IDChirias
      DataInceput
      Durata
      DataSfarsit
      CrestereProcent
      ChirieInitiala
      plata_curent
      numar_persoane
      termen_plata
      numar_locuri_parcare
      Nota
    }
  }
`;

const AddContractForm = ({ propertyId, onClose, onSuccess }) => {
  // Toate hook-urile trebuie să fie aici la început
  const [chiriasi, setChiriasi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddChirias, setShowAddChirias] = useState(false);
  const { showSuccess, showError } = useNotification();
const [formData, setFormData] = useState({
  numar_contract: '',
  IDChirias: '',
  DataInceput: new Date().toISOString().split('T')[0],
  Durata: 12,
  CrestereProcent: 0,
  ChirieInitiala: '',  // lăsăm gol pentru input numeric
  plata_curent: 'pausal',
  numar_persoane: 1,
  termen_plata: 1,  // valoare default
  numar_locuri_parcare: 0,
  Nota: ''
});
  useEffect(() => {
    fetchChiriasi();
  }, []);

  const fetchChiriasi = async () => {
    try {
      const result = await client.graphql({
        query: listChiriasi
      });
      setChiriasi(result.data.listChiriasi.items);
    } catch (error) {
      console.error('Error fetching chiriasi:', error);
      showError('Nu s-au putut încărca chiriașii');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const input = {
        ...formData,
        IDProprietate: propertyId,
        DataSfarsit: calculateEndDate(formData.DataInceput, formData.Durata)
      };

      await client.graphql({
        query: createContract,
        variables: { input }
      });

      showSuccess('Contractul a fost adăugat cu succes!');
      onSuccess();
    } catch (error) {
      console.error('Error creating contract:', error);
      showError('Nu s-a putut crea contractul. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (startDate, duration) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + duration);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Adaugă Contract Nou</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Număr Contract*
                </label>
                <input
                  type="text"
                  value={formData.numar_contract}
                  onChange={(e) => setFormData({...formData, numar_contract: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
  <label className="block text-sm font-medium mb-1">
    Chiriaș*
  </label>
  <div className="flex gap-2">
    <select
      value={formData.IDChirias}
      onChange={(e) => setFormData({...formData, IDChirias: e.target.value})}
      className="w-full p-2 border rounded"
      required
    >
      <option value="">Selectează chiriaș</option>
      {chiriasi.map(chirias => (
        <option key={chirias.id} value={chirias.id}>
          {chirias.nume} ({chirias.email})
        </option>
      ))}
    </select>
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowAddChirias(true)}
    >
      +
    </Button>
  </div>
</div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Început*
                </label>
                <input
                  type="date"
                  value={formData.DataInceput}
                  onChange={(e) => setFormData({...formData, DataInceput: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Durată (luni)*
                </label>
                <input
                  type="number"
                  value={formData.Durata}
                  onChange={(e) => setFormData({...formData, Durata: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Chirie Inițială*
                </label>
               <input
  type="number"
  value={formData.ChirieInitiala || ''}  // folosim string gol dacă e undefined
  onChange={(e) => setFormData({
    ...formData, 
    ChirieInitiala: e.target.value ? parseFloat(e.target.value) : ''
  })}
  className="w-full p-2 border rounded"
  step="0.01"
  required
/>

              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Creștere Anuală (%)
                </label>
                <input
                  type="number"
                  value={formData.CrestereProcent}
                  onChange={(e) => setFormData({...formData, CrestereProcent: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Plată Curent*
                </label>
                <select
                  value={formData.plata_curent}
                  onChange={(e) => setFormData({...formData, plata_curent: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="pausal">Paușal</option>
                  <option value="contor">Contor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Număr Persoane*
                </label>
               <input
  type="number"
  value={formData.numar_persoane || 1}
  onChange={(e) => setFormData({
    ...formData, 
    numar_persoane: e.target.value ? parseInt(e.target.value) : 1
  })}
  className="w-full p-2 border rounded"
  min="1"
  required
/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Termen Plată (ziua lunii)*
                </label>
                <input
  type="number"
  value={formData.termen_plata || 1}
  onChange={(e) => setFormData({
    ...formData, 
    termen_plata: e.target.value ? parseInt(e.target.value) : 1
  })}
  className="w-full p-2 border rounded"
  min="1"
  max="31"
  required
/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Număr Locuri Parcare
                </label>
                <input
  type="number"
  value={formData.numar_locuri_parcare || 0}
  onChange={(e) => setFormData({
    ...formData, 
    numar_locuri_parcare: e.target.value ? parseInt(e.target.value) : 0
  })}
  className="w-full p-2 border rounded"
  min="0"
/>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Notă
                </label>
                <textarea
                  value={formData.Nota}
                  onChange={(e) => setFormData({...formData, Nota: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Anulează
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Se salvează...' : 'Salvează Contract'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
	  
{showAddChirias && (
  <AddChiriasForm
    isModal={true}
    onClose={() => setShowAddChirias(false)}
    onSuccess={(newChirias) => {
  setChiriasi([...chiriasi, newChirias]);
  setFormData({...formData, IDChirias: newChirias.id});
  setShowAddChirias(false);
  // Reset form
  setFormData({
    nume: '',
    email: '',
    telefon: '',
    telefon2: '',
    adresa: '',
    cont_bancar: '',
    cnp_cui: '',
    persoana_contact: '',
    nota: ''
  });
}}
  />
)}	  
    </div>
  );
};

export default AddContractForm;