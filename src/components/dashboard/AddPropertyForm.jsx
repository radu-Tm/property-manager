// AddPropertyForm.jsx
// Formular pentru adăugarea unei proprietăți noi
// Funcționalități:
// - Adăugare proprietate cu/fără clădire asociată
// - Upload releveu
// - Gestionare câmpuri condiționate de tipul proprietății
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { uploadData } from 'aws-amplify/storage';
import { useNotification } from '../../hooks/useNotification';
// Mutație pentru crearea proprietății
const createProprietate = /* GraphQL */ `
  mutation CreateProprietate($input: CreateProprietateInput!, $email: String!) {
    createProprietate(input: $input, email: $email) {
      id
      nume
      tip
      releveu
      adresa
      nivel
      bai
      suprafata
      inaltime
      geamuri
      nota
      id_cladire
      id_proprietar
    }
  }
`;
// Query pentru lista de clădiri
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

const AddPropertyForm = ({ onSuccess, onCancel }) => {
	// State-uri pentru gestionarea UI și date
	const { user } = useAuth(); // Date utilizator curent
 const [showBuildingFields, setShowBuildingFields] = useState(false);
 const [cladiri, setCladiri] = useState([]); //lista cladirilor
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const { showSuccess, showError } = useNotification();
 // State pentru datele formularului
 const [formData, setFormData] = useState({
   nume: '',
   tip: 'Apartament',
   releveu: '',
   adresa: '',
   id_cladire: '',
   nivel: '',
   bai: '',
   suprafata: '',
   inaltime: '',
   geamuri: true,
   nota: '',
   id_proprietar:''
 });

//creează un client pentru interacțiunea cu API-ul GraphQL AWS AppSync
//este configurat direct cu Endpoint-ul GraphQL definit în configurația Amplify, cu Credențialele și autentificarea necesare şi cu Headere-le necesare pentru request-uri
 const client = generateClient();
  // Încarcă lista de clădiri la montare
 useEffect(() => {
   const fetchCladiri = async () => {
     try {
       const result = await client.graphql({
         query: listCladiri,
		 variables: { email: user.email }
       });
       setCladiri(result.data.listCladiri.items);
     } catch (error) {
       console.error('Error fetching cladiri:', error);
     }
   };
   fetchCladiri();
 }, []);
// Handlers pentru diferite acțiuni

 const handleCladireChange = (e) => {
	 // ... logică pentru schimbarea clădirii
   const value = e.target.value;
   setFormData(prev => ({...prev, id_cladire: value}));
   setShowBuildingFields(!!value);
 };
const handleReleuUpload = async (e) => {
	// ... logică pentru upload releveu -> imagine
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Convertim fișierul în Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setFormData(prev => ({
        ...prev,
        releveu: base64
      }));
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error uploading releveu:', error);
  }
};
const handleImageUpload = async (e) => {
	// ... logică pentru upload imagine (alte documente)
    const file = e.target.files[0];
    if (!file) return;

    try {
        const result = await uploadData({
            key: `relevee/${Date.now()}-${file.name}`,
            data: file,
            options: {
                contentType: file.type
            }
        }).result;

        setFormData(prev => ({
            ...prev,
            releveu: result.key
        }));
    } catch (error) {
        console.error('Error uploading file:', error);
        showError('Eroare la încărcarea fișierului');
    }
};

// Handler principal pentru salvare
 const handleSubmit = async (e) => {
	 //..logica salvare
   e.preventDefault();
   setLoading(true);
   setError('');

   try {
     const input = {
       nume: formData.nume,
       tip: formData.tip,
       releveu: formData.releveu,
       adresa: formData.adresa,
       nivel: formData.nivel,
       bai: formData.bai ? parseInt(formData.bai) : null,
       suprafata: formData.suprafata ? parseFloat(formData.suprafata) : null,
       inaltime: formData.inaltime ? parseFloat(formData.inaltime) : null,
       geamuri: formData.geamuri,
       nota: formData.nota || null,
       id_cladire: formData.id_cladire || null
     };

     const result = await client.graphql({
       query: createProprietate,
       variables: { 
         input,
         email: user.email  // adăugăm email-ul
       }
     });

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
             <label className="block text-sm font-medium mb-1">Nume Proprietate*</label>
             <input
               type="text"
               value={formData.nume || ''}
               onChange={(e) => setFormData(prev => ({...prev, nume: e.target.value}))}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Tip Proprietate*</label>
             <select
               value={formData.tip || ''}
               onChange={(e) => setFormData(prev => ({...prev, tip: e.target.value}))}
               className="w-full p-2 border rounded bg-white"
               required
             >
               <option value="Apartament">Apartament</option>
               <option value="Comercial">Spațiu Comercial</option>
               <option value="Altul">Altul</option>
             </select>
           </div>
		       <div>
             <label className="block text-sm font-medium mb-1">Clădire</label>
             <select
               value={formData.id_cladire || ''}
               onChange={handleCladireChange}
               className="w-full p-2 border rounded bg-white"
             >
               <option value="">Fără clădire</option>
               {cladiri.map(cladire => (
                 <option key={cladire.id} value={cladire.id}>{cladire.nume}</option>
               ))}
             </select>
           </div>

       
             <div>
               <label className="block text-sm font-medium mb-1">Suprafață(m²)</label>
               <input
                 type="number"
                 value={formData.suprafata || ''}
                 onChange={(e) => setFormData(prev => ({...prev, suprafata: e.target.value}))}
                 className="w-full p-2 border rounded"
                 min="0"
                 step="0.01"
               />
             </div>
  {!showBuildingFields && (
           <div className="md:col-span-2">
             <label className="block text-sm font-medium mb-1">Adresă*</label>
             <input
               type="text"
               value={formData.adresa || ''}
               onChange={(e) => setFormData(prev => ({...prev, adresa: e.target.value}))}
               className="w-full p-2 border rounded"
               required
             />
           </div>
  )}         
           <div>
             <label className="block text-sm font-medium mb-1">Nivel</label>
             <input
               type="number"
               value={formData.nivel || ''}
               onChange={(e) => setFormData(prev => ({...prev, nivel: e.target.value}))}
               className="w-full p-2 border rounded"
               min="0"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Băi</label>
             <input
               type="number"
               value={formData.bai || ''}
               onChange={(e) => setFormData(prev => ({...prev, bai: e.target.value}))}
               className="w-full p-2 border rounded"
               min="0"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Înălțime (m)</label>
             <input
               type="number"
               value={formData.inaltime || ''}
               onChange={(e) => setFormData(prev => ({...prev, inaltime: e.target.value}))}
               className="w-full p-2 border rounded"
               min="0"
               step="0.01"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Are geamuri</label>
             <input
               type="checkbox"
               checked={formData.geamuri}
               onChange={(e) => setFormData(prev => ({...prev, geamuri: e.target.checked}))}
               className="ml-2"
             />
           </div>

           <div className="md:col-span-2">
             <label className="block text-sm font-medium mb-1">Notă</label>
             <textarea
               value={formData.nota || ''}
               onChange={(e) => setFormData(prev => ({...prev, nota: e.target.value}))}
               className="w-full p-2 border rounded"
               rows="3"
             />
           </div>
         </div>

         {error && (
           <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</div>
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