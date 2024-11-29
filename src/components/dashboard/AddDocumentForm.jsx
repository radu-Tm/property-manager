import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileUp } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { uploadData } from 'aws-amplify/storage';

const client = generateClient();

const addDocument = /* GraphQL */ `
  mutation AddDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      id
      nume
      DataColectarii
      data_expirare
      nota
      id_proprietate
    }
  }
`;

const AddDocumentForm = ({ propertyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nume: '',
    DataColectarii: new Date().toISOString().split('T')[0],
    data_expirare: '',
    nota: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fisier_key = null;
      
      if (file) {
        // Generăm un nume unic pentru fișier
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const key = `documents/${propertyId}/${uniqueFileName}`;

        // Încărcăm fișierul în S3
        const result = await uploadData({
          key: key,
          data: file,
          options: {
            contentType: file.type
          }
        }).result;

        fisier_key = key;
      }

      // Salvăm documentul în baza de date
      const input = {
        ...formData,
        fisier_key,
        id_proprietate: propertyId
      };

      const result = await client.graphql({
        query: addDocument,
        variables: { input }
      });

      showSuccess('Documentul a fost adăugat cu succes!');
      onSuccess();
    } catch (error) {
      console.error('Error adding document:', error);
      showError('Nu s-a putut adăuga documentul. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Adaugă Document Nou</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nume Document*
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
                Data Colectării
              </label>
              <input
                type="date"
                value={formData.DataColectarii}
                onChange={(e) => setFormData({...formData, DataColectarii: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Data Expirare
              </label>
              <input
                type="date"
                value={formData.data_expirare}
                onChange={(e) => setFormData({...formData, data_expirare: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Fișier
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : 'Click pentru a încărca un fișier'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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
                {loading ? 'Se încarcă...' : 'Adaugă Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDocumentForm;