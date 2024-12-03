// AddPropertyForm.jsx
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const createProprietate = /* GraphQL */ `
 mutation CreateProprietate($input: CreateProprietateInput!) {
   createProprietate(input: $input) {
     id
     nume
     tip
     adresa
     nivel
     dormitoare
     bai
     suprafata
     suprafata_cladire
     suprafata_comune
     inaltime
     geamuri
     nota
     id_cladire
   }
 }
`;

const listCladiri = /* GraphQL */ `
 query ListCladiri {
   listCladiri {
     items {
       id
       nume
     }
   }
 }
`;

const AddPropertyForm = ({ onSuccess, onCancel }) => {
 const [showBuildingFields, setShowBuildingFields] = useState(false);
 const [cladiri, setCladiri] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [formData, setFormData] = useState({
   nume: '',
   tip: 'Apartament',
   adresa: '',
   id_cladire: '',
   nivel: '',
   dormitoare: '',
   bai: '',
   suprafata: '',
   suprafata_cladire: '',
   suprafata_comune: '',
   inaltime: '',
   geamuri: true,
   nota: ''
 });

 const client = generateClient();

 useEffect(() => {
   const fetchCladiri = async () => {
     try {
       const result = await client.graphql({
         query: listCladiri
       });
       setCladiri(result.data.listCladiri.items);
     } catch (error) {
       console.error('Error fetching cladiri:', error);
     }
   };
   fetchCladiri();
 }, []);

 const handleCladireChange = (e) => {
   const value = e.target.value;
   setFormData(prev => ({...prev, id_cladire: value}));
   setShowBuildingFields(!!value);
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   setError('');

   try {
     const input = {
       nume: formData.nume,
       tip: formData.tip,
       adresa: formData.adresa,
       id_cladire: formData.id_cladire || null,
       nivel: formData.nivel ? parseInt(formData.nivel) : null,
       dormitoare: formData.dormitoare ? parseInt(formData.dormitoare) : null,
       bai: formData.bai ? parseInt(formData.bai) : null,
       suprafata: formData.suprafata ? parseFloat(formData.suprafata) : null,
       suprafata_cladire: formData.suprafata_cladire ? parseFloat(formData.suprafata_cladire) : null,
       suprafata_comune: formData.suprafata_comune ? parseFloat(formData.suprafata_comune) : null,
       inaltime: formData.inaltime ? parseFloat(formData.inaltime) : null,
       geamuri: formData.geamuri
     };

     const result = await client.graphql({
       query: createProprietate,
       variables: { input }
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
               <option value="Casă">Casă</option>
               <option value="Comercial">Spațiu Comercial</option>
               <option value="Altul">Altul</option>
             </select>
           </div>

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

           {showBuildingFields && (
             <div>
               <label className="block text-sm font-medium mb-1">Suprafață Clădire (m²)</label>
               <input
                 type="number"
                 value={formData.suprafata_cladire || ''}
                 onChange={(e) => setFormData(prev => ({...prev, suprafata_cladire: e.target.value}))}
                 className="w-full p-2 border rounded"
                 min="0"
                 step="0.01"
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
             <label className="block text-sm font-medium mb-1">Dormitoare</label>
             <input
               type="number"
               value={formData.dormitoare || ''}
               onChange={(e) => setFormData(prev => ({...prev, dormitoare: e.target.value}))}
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
             <label className="block text-sm font-medium mb-1">Suprafață (m²)</label>
             <input
               type="number"
               value={formData.suprafata || ''}
               onChange={(e) => setFormData(prev => ({...prev, suprafata: e.target.value}))}
               className="w-full p-2 border rounded"
               min="0"
               step="0.01"
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Suprafață Comună (m²)</label>
             <input
               type="number"
               value={formData.suprafata_comune || ''}
               onChange={(e) => setFormData(prev => ({...prev, suprafata_comune: e.target.value}))}
               className="w-full p-2 border rounded"
               min="0"
               step="0.01"
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