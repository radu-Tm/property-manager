// Formular pentru editarea unui contract existent
// Permite modificarea:
// - Detaliilor contractului
// - Chiriașului asociat
// - Setărilor de contor

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';
import AddChiriasForm from './AddChiriasForm';

//creează un client pentru interacțiunea cu API-ul GraphQL AWS AppSync
//este configurat direct cu Endpoint-ul GraphQL definit în configurația Amplify, cu Credențialele și autentificarea necesare şi cu Headere-le necesare pentru request-uri
const client = generateClient();

// Queries și mutații necesare
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

const updateContract = /* GraphQL */ `
  mutation UpdateContract($input: UpdateContractInput!) {
    updateContract(input: $input) {
      id
      numar_contract
      DataInceput
      DataSfarsit
      Durata
      CrestereProcent
      ChirieInitiala
      plata_curent
      numar_persoane
      termen_plata
      numar_locuri_parcare
      Nota
      procent_comune
    }
  }
`;

const updateContorCitire = /* GraphQL */ `
  mutation UpdateContorCitire($input: UpdateContorCitireInput!) {
    updateContorCitire(input: $input) {
      id
      id_contract
      tip
      data_citire
      index_vechi
      index_nou
    }
  }
`;

// State-uri pentru gestionarea datelor
const EditContractForm = ({ contract, onClose, onSuccess }) => {
	
	  useEffect(() => {
		  //dezactivare sageti cand esti pe input numeric in formular
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target.tagName === 'INPUT' && target.type === 'number' &&
          (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup pentru a preveni atașarea multiplă
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
	
	 const [chiriasi, setChiriasi] = useState([]);
	  const [showAddChirias, setShowAddChirias] = useState(false);
	
  const [formData, setFormData] = useState({
    id: contract.id,
	IDProprietate: contract.IDProprietate || '',
	IDChirias: contract.IDChirias || '',
    numar_contract: contract.numar_contract || '',
    DataInceput: contract.DataInceput || '',
    Durata: contract.Durata || '',
    CrestereProcent: contract.CrestereProcent || 0,
    ChirieInitiala: contract.ChirieInitiala || '',
    plata_curent: contract.plata_curent || 'pausal',
    numar_persoane: contract.numar_persoane || 1,
    termen_plata: contract.termen_plata || 1,
    numar_locuri_parcare: contract.numar_locuri_parcare || 0,
	procent_comune: contract.procent_comune || 1.0,
  index_initial: contract.index_initial || '',
    Nota: contract.Nota || ''
  });
  
  useEffect(() => {
    if (contract?.chirias) {
      setFormData(prev => ({
        ...prev,
        IDChirias: contract.chirias.id
      }));
    }
  }, [contract]);
  
   useEffect(() => {
    if (contract?.index_initial) {
      setFormData(prev => ({
        ...prev,
        index_initial: contract.index_initial
      }));
    }
  }, [contract]);
  
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


  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { index_initial, ...contractInput } = formData;
    
    const result = await client.graphql({
      query: updateContract,
      variables: {
        input: {
          id: contract.id,
          ...contractInput
        }
      }
    });

    if (formData.plata_curent === 'contor' && index_initial) {
      await client.graphql({
        query: updateContorCitire,
        variables: {
          input: {
            id_contract: contract.id,
            tip: 'Curent', 
            data_citire: new Date().toISOString().split('T')[0],
            index_vechi: 0,
            index_nou: parseFloat(index_initial)
          }
        }
      });
    }

    showSuccess('Contractul a fost actualizat cu succes');
    onSuccess?.();
  } catch (error) {
    console.error('Error updating contract:', error);
    showError('Nu s-a putut actualiza contractul');
  } finally {
    setLoading(false);
  }
};

console.log('Contract primit:', contract);
  return (
   
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Editare Contract</CardTitle>
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
                  value={formData.DataInceput.slice(0, 10)} 
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
                  onChange={(e) => setFormData({...formData, Durata: parseInt(e.target.value) || 12})}
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
                  value={formData.ChirieInitiala}
                  onChange={(e) => setFormData({...formData, ChirieInitiala: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
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
                  onChange={(e) => setFormData({...formData, CrestereProcent: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
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
                  value={formData.numar_persoane}
                  onChange={(e) => setFormData({...formData, numar_persoane: parseInt(e.target.value) || 1})}
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
                  value={formData.termen_plata}
                  onChange={(e) => setFormData({...formData, termen_plata: parseInt(e.target.value) || 1})}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="31"
                  required
                />
              </div>
			  
			  {formData.plata_curent === 'contor' && (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">
        Procent părți comune (%)
      </label>
      <input
        type="number"
        value={formData.procent_comune}
        onChange={(e) => setFormData({...formData, procent_comune: parseFloat(e.target.value)})}
        className="w-full p-2 border rounded"
        min="0"
        max="100"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">
        Index contor la începutul contractului*
      </label>
      <input
        type="number"
        value={formData.index_initial}
        onChange={(e) => setFormData({...formData, index_initial: parseFloat(e.target.value)})}
        className="w-full p-2 border rounded"
        required={formData.plata_curent === 'contor'}
      />
    </div>
  </>
)}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Număr Locuri Parcare
                </label>
                <input
                  type="number"
                  value={formData.numar_locuri_parcare}
                  onChange={(e) => setFormData({...formData, numar_locuri_parcare: parseInt(e.target.value) || 0})}
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
                {loading ? 'Se salvează...' : 'Salvează Modificările'}
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

export default EditContractForm;