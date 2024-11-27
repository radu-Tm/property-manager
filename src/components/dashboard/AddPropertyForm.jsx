import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';

const createProprietate = /* GraphQL */ `
  mutation CreateProprietate(
    $input: CreateProprietateInput!
  ) {
    createProprietate(input: $input) {
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
    }
  }
`;

const AddPropertyForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nume: '',
    tip: 'Apartament',
    adresa: '',
    NumarCladire: '',
    nivel: '',
    dormitoare: '',
    bai: '',
    suprafata: '',
    nota: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convertim valorile numerice
      const input = {
        ...formData,
        nivel: parseInt(formData.nivel) || 0,
        dormitoare: parseInt(formData.dormitoare) || 0,
        bai: parseInt(formData.bai) || 0,
        suprafata: parseFloat(formData.suprafata) || 0
      };

      const result = await client.graphql({
        query: createProprietate,
        variables: { input }
      });

      console.log('Property created:', result);
      onSuccess?.();
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Nu s-a putut adăuga proprietatea. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Adaugă Proprietate Nouă</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nume Proprietate*
              </label>
              <input
                type="text"
                value={formData.nume}
                onChange={(e) => setFormData({...formData, nume: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tip Proprietate*
              </label>
              <select
                value={formData.tip}
                onChange={(e) => setFormData({...formData, tip: e.target.value})}
                className="w-full p-2 border rounded bg-white"
                required
              >
                <option value="Apartament">Apartament</option>
                <option value="Casă">Casă</option>
                <option value="Comercial">Spațiu Comercial</option>
                <option value="Altul">Altul</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Adresă*
              </label>
              <input
                type="text"
                value={formData.adresa}
                onChange={(e) => setFormData({...formData, adresa: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Număr Clădire
              </label>
              <input
                type="text"
                value={formData.NumarCladire}
                onChange={(e) => setFormData({...formData, NumarCladire: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nivel
              </label>
              <input
                type="number"
                value={formData.nivel}
                onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Dormitoare
              </label>
              <input
                type="number"
                value={formData.dormitoare}
                onChange={(e) => setFormData({...formData, dormitoare: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Băi
              </label>
              <input
                type="number"
                value={formData.bai}
                onChange={(e) => setFormData({...formData, bai: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Suprafață (m²)
              </label>
              <input
                type="number"
                value={formData.suprafata}
                onChange={(e) => setFormData({...formData, suprafata: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Notă
              </label>
              <textarea
                value={formData.nota}
                onChange={(e) => setFormData({...formData, nota: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Anulează
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Se adaugă...' : 'Adaugă Proprietate'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPropertyForm;