// Formular pentru adăugarea unui chiriaș nou
// Poate fi folosit ca:
// - Formular independent
// - Modal (când isModal=true)
// Folosește React Hook Form pentru gestionarea formularului
// Notificări pentru succes/eroare prin useNotification
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';

//creează un client pentru interacțiunea cu API-ul GraphQL AWS AppSync
//este configurat direct cu Endpoint-ul GraphQL definit în configurația Amplify, cu Credențialele și autentificarea necesare şi cu Headere-le necesare pentru request-uri
const client = generateClient();

// Mutația GraphQL pentru crearea unui chiriaș nou în baza de date
const createChirias = /* GraphQL */ `
  mutation CreateChirias($input: CreateChiriasInput!) {
    createChirias(input: $input) {
      id
      nume
      email
      telefon
      telefon2
      adresa
      cont_bancar
      cnp_cui
      persoana_contact
      nota
    }
  }
`;

// State pentru datele formularului - toate câmpurile inițializate goale
const AddChiriasForm = ({ onClose, onSuccess, isModal = false }) => {
  const [formData, setFormData] = useState({
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

// State pentru loading în timpul salvării
  const [loading, setLoading] = useState(false);
  
// Hook pentru notificări UI
  const { showSuccess, showError } = useNotification();

// Handler pentru salvarea chiriașului
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
// Trimite datele către backend		
      const result = await client.graphql({
        query: createChirias,
        variables: { input: formData }
      });
// Notifică succesul și execută callback-ul de succes
      showSuccess('Chiriaș adăugat cu succes!');
      onSuccess(result.data.createChirias);
    } catch (error) {
      console.error('Error creating chirias:', error);
      showError('Nu s-a putut adăuga chiriașul. Vă rugăm încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
// Template-ul formularului - reutilizabil
  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nume*
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
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telefon Principal
          </label>
          <input
            type="tel"
            value={formData.telefon}
            onChange={(e) => setFormData({...formData, telefon: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telefon Secundar
          </label>
          <input
            type="tel"
            value={formData.telefon2}
            onChange={(e) => setFormData({...formData, telefon2: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            CNP/CUI
          </label>
          <input
            type="text"
            value={formData.cnp_cui}
            onChange={(e) => setFormData({...formData, cnp_cui: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cont Bancar
          </label>
          <input
            type="text"
            value={formData.cont_bancar}
            onChange={(e) => setFormData({...formData, cont_bancar: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Persoană Contact
          </label>
          <input
            type="text"
            value={formData.persoana_contact}
            onChange={(e) => setFormData({...formData, persoana_contact: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Adresă
          </label>
          <textarea
            value={formData.adresa}
            onChange={(e) => setFormData({...formData, adresa: e.target.value})}
            className="w-full p-2 border rounded"
            rows="2"
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
            rows="2"
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
          {loading ? 'Se salvează...' : 'Salvează Chiriaș'}
        </Button>
      </div>
    </form>
  );
// Render condiționat bazat pe prop-ul isModal
  if (isModal) {
    return (
	// Randează formularul într-un modal
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Adaugă Chiriaș Nou</CardTitle>
          </CardHeader>
          <CardContent>
            {FormContent}
          </CardContent>
        </Card>
      </div>
    );
  }
// Altfel, returnează doar formularul
  return FormContent;
};

export default AddChiriasForm;