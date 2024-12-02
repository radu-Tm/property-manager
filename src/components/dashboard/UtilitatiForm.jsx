import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from '../ui/card';

const createUtilitate = /* GraphQL */ `
  mutation CreateUtilitate($input: CreateUtilitateInput!) {
    createUtilitate(input: $input) {
      id
      tip
      luna
      suma_totala
    }
  }
`;

const UtilitatiForm = ({ id_cladire, luna }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tip: 'Curent',
    suma_totala: '',
    index_vechi: '',
    index_nou: ''
  });

  const TIPURI_UTILITATI = [
    { tip: 'Curent', necesitaIndex: true },
    { tip: 'Apa', necesitaIndex: true },
    { tip: 'Internet', necesitaIndex: false },
    { tip: 'Gunoi', necesitaIndex: false }
  ];
  const { showSuccess, showError } = useNotification();
  const client = generateClient();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await client.graphql({
      query: createUtilitate,
      variables: {
        input: {
          id_cladire,
          tip: formData.tip,
          luna: luna, // Ne asigurăm că luna este în format 'YYYY-MM'
          suma_totala: parseFloat(formData.suma_totala),
          index_vechi: formData.index_vechi ? parseFloat(formData.index_vechi) : null,
          index_nou: formData.index_nou ? parseFloat(formData.index_nou) : null
        }
      }
    });
    
    showSuccess('Factura a fost înregistrată cu succes');
    setFormData({ 
      tip: 'Curent',
      suma_totala: '',
      index_vechi: '',
      index_nou: ''
    });
  } catch (error) {
    console.error('Error:', error);
    showError('Eroare la înregistrarea facturii');
  } finally {
    setLoading(false);
  }
};

 return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Înregistrare Factură</h3>
        <p className="text-sm text-gray-500">Luna: {new Date(luna + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tip Utilitate</label>
            <select
              value={formData.tip}
              onChange={(e) => setFormData({ 
                ...formData, 
                tip: e.target.value,
                index_vechi: '',
                index_nou: ''
              })}
              className="w-full p-2 border rounded"
              required
            >
              {TIPURI_UTILITATI.map(({ tip }) => (
                <option key={tip} value={tip}>{tip}</option>
              ))}
            </select>
          </div>
          
          {TIPURI_UTILITATI.find(u => u.tip === formData.tip).necesitaIndex && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Index Vechi</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.index_vechi}
                  onChange={(e) => setFormData({ ...formData, index_vechi: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Index Nou</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.index_nou}
                  onChange={(e) => setFormData({ ...formData, index_nou: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Suma Totală</label>
            <input
              type="number"
              step="0.01"
              value={formData.suma_totala}
              onChange={(e) => setFormData({ ...formData, suma_totala: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Se înregistrează...' : 'Înregistrează Factura'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UtilitatiForm;