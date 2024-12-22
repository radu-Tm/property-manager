import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';

const client = generateClient();

const updateContract = /* GraphQL */ `
  mutation UpdateContract($input: UpdateContractInput!) {
    updateContract(input: $input) {
      id
      numar_contract
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

const EditContractForm = ({ contract, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: contract.id,
    numar_contract: contract.numar_contract || '',
    DataInceput: contract.DataInceput || '',
    Durata: contract.Durata || '',
    CrestereProcent: contract.CrestereProcent || 0,
    ChirieInitiala: contract.ChirieInitiala || '',
    plata_curent: contract.plata_curent || 'pausal',
    numar_persoane: contract.numar_persoane || 1,
    termen_plata: contract.termen_plata || 1,
    numar_locuri_parcare: contract.numar_locuri_parcare || 0,
    Nota: contract.Nota || ''
  });
  

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calculăm data de sfârșit în funcție de data de început și durata
      const startDate = new Date(formData.DataInceput);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.Durata));
      
      const result = await client.graphql({
        query: updateContract,
        variables: { 
          input: {
            ...formData,
            DataSfarsit: endDate.toISOString().split('T')[0]  // formatăm data ca YYYY-MM-DD
          }
        }
      });

      showSuccess('Contractul a fost actualizat cu succes');
      onSuccess();
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
                  onChange={(e) => setFormData({...formData, CrestereProcent: parseFloat(e.target.value) || 0})}
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
    </div>
  );
};

export default EditContractForm;