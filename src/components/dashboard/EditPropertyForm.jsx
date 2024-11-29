import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';
const client = generateClient();

const updateProprietate = /* GraphQL */ `
  mutation UpdateProprietate(
    $input: UpdateProprietateInput!
  ) {
    updateProprietate(input: $input) {
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

const EditPropertyForm = ({ property, onClose, onSuccess }) => {
	const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    id: property.id,
    nume: property.nume || '',
    tip: property.tip || 'Apartament',
    adresa: property.adresa || '',
    NumarCladire: property.NumarCladire || '',
    nivel: property.nivel || '',
    dormitoare: property.dormitoare || '',
    bai: property.bai || '',
    suprafata: property.suprafata || '',
    nota: property.nota || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convertim valorile numerice
      const input = {
        id: formData.id,
        nume: formData.nume,
        tip: formData.tip,
        adresa: formData.adresa,
        NumarCladire: formData.NumarCladire,
        nivel: parseInt(formData.nivel) || null,
        dormitoare: parseInt(formData.dormitoare) || null,
        bai: parseInt(formData.bai) || null,
        suprafata: parseFloat(formData.suprafata) || null,
        nota: formData.nota
      };

      await client.graphql({
        query: updateProprietate,
        variables: { input: formData }
      });
showSuccess("Proprietatea a fost actualizată cu succes!");
      onSuccess();
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Nu s-a putut actualiza proprietatea. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Editare Proprietate</CardTitle>
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
                onClick={onClose}
                disabled={loading}
              >
                Anulează
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Se salvează...' : 'Salvează'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPropertyForm;