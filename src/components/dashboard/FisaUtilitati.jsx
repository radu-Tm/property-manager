import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';

const createFacturaUtilitate = /* GraphQL */ `
  mutation CreateFacturaUtilitate($input: CreateFacturaUtilitateInput!) {
    createFacturaUtilitate(input: $input) {
      id
      tip
      numar_factura
      data_factura
      suma
      perioada_start
      perioada_end
      estimat
      index_vechi
      index_nou
    }
  }
`;

const getFacturiLunaCurenta = /* GraphQL */ `
 query GetFacturiLunaCurenta($luna: String!) {
   getFacturiLunaCurenta(luna: $luna) {
     id
     tip
     numar_factura
     data_factura
     suma
     perioada_start
     perioada_end
     estimat
     index_vechi
     index_nou
   }
 }
`;

const AdaugaFacturaForm = ({ onFacturaAdaugata }) => {
 const [formData, setFormData] = useState({
   tip: 'RETIM',
   numar_factura: '',
   data_factura: '',
   suma: '',
   perioada_start: '',
   perioada_end: '',
   estimat: false,
   index_vechi: '',
   index_nou: ''
 });

 const [loading, setLoading] = useState(false);
 const { showSuccess, showError } = useNotification();
 const client = generateClient();

 const tipuriUtilitati = [
   'RETIM',
   'AQUATIM',
   'GAZ',
   'ENERGIE',
   'CURATENIE',
   'CONSUMABILE'
 ];

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);

   try {
     const input = {
            tip: formData.tip,
            numar_factura: formData.numar_factura,
            data_factura: formData.data_factura,
            suma: parseFloat(formData.suma),
            perioada_start: formData.perioada_start,
            perioada_end: formData.perioada_end,
            estimat: formData.estimat,
            // Adăugăm indexurile doar dacă există și tipul este ENERGIE
            ...(formData.tip === 'ENERGIE' && formData.index_vechi ? {
                index_vechi: parseFloat(formData.index_vechi)
            } : {}),
            ...(formData.tip === 'ENERGIE' && formData.index_nou ? {
                index_nou: parseFloat(formData.index_nou)
            } : {})
        };

        console.log('Input being sent:', input); // Pentru debug

     if (formData.tip === 'ENERGIE' && formData.index_vechi && formData.index_nou) {
       input.index_vechi = parseFloat(formData.index_vechi);
       input.index_nou = parseFloat(formData.index_nou);
     }

     await client.graphql({
       query: createFacturaUtilitate,
       variables: { input }
     });

     showSuccess('Factura a fost adăugată cu succes');
     setFormData({
       tip: 'RETIM',
       numar_factura: '',
       data_factura: '',
       suma: '',
       perioada_start: '',
       perioada_end: '',
       estimat: false,
       index_vechi: '',
       index_nou: ''
     });
     onFacturaAdaugata();
   } catch (error) {
     showError('Eroare la adăugarea facturii');
     console.error('Error:', error);
   } finally {
     setLoading(false);
   }
 };

 return (
   <Card>
     <CardHeader>
       <CardTitle>Adaugă Factură Utilități</CardTitle>
     </CardHeader>
     <CardContent>
       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">Tip Utilitate</label>
             <select
               value={formData.tip}
               onChange={(e) => setFormData({...formData, tip: e.target.value})}
               className="w-full p-2 border rounded"
               required
             >
               {tipuriUtilitati.map(tip => (
                 <option key={tip} value={tip}>{tip}</option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Număr Factură</label>
             <input
               type="text"
               value={formData.numar_factura}
               onChange={(e) => setFormData({...formData, numar_factura: e.target.value})}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Data Factură</label>
             <input
               type="date"
               value={formData.data_factura}
               onChange={(e) => setFormData({...formData, data_factura: e.target.value})}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Sumă</label>
             <input
               type="number"
               step="0.01"
               value={formData.suma}
               onChange={(e) => setFormData({...formData, suma: e.target.value})}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Perioada Start</label>
             <input
               type="date"
               value={formData.perioada_start}
               onChange={(e) => setFormData({...formData, perioada_start: e.target.value})}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium mb-1">Perioada End</label>
             <input
               type="date"
               value={formData.perioada_end}
               onChange={(e) => setFormData({...formData, perioada_end: e.target.value})}
               className="w-full p-2 border rounded"
               required
             />
           </div>

           {formData.tip === 'ENERGIE' && (
             <>
               <div>
                 <label className="block text-sm font-medium mb-1">Index Vechi</label>
                 <input
                   type="number"
                   step="0.01"
                   value={formData.index_vechi}
                   onChange={(e) => setFormData({...formData, index_vechi: e.target.value})}
                   className="w-full p-2 border rounded"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Index Nou</label>
                 <input
                   type="number"
                   step="0.01"
                   value={formData.index_nou}
                   onChange={(e) => setFormData({...formData, index_nou: e.target.value})}
                   className="w-full p-2 border rounded"
                 />
               </div>
             </>
           )}

           <div className="flex items-center">
             <input
               type="checkbox"
               checked={formData.estimat}
               onChange={(e) => setFormData({...formData, estimat: e.target.checked})}
               className="mr-2"
             />
             <label className="text-sm font-medium">Estimat</label>
           </div>
         </div>

         <Button 
           type="submit"
           disabled={loading}
           className="w-full"
         >
           {loading ? 'Se adaugă...' : 'Adaugă Factură'}
         </Button>
       </form>
     </CardContent>
   </Card>
 );
};

const ListaFacturi = React.forwardRef((props, ref) => {
 const [facturi, setFacturi] = useState([]);
 const [loading, setLoading] = useState(true);
 const client = generateClient();

 const fetchFacturi = async () => {
   try {
     const lunaActuala = new Date().toISOString().slice(0, 7);
     const result = await client.graphql({
       query: getFacturiLunaCurenta,
       variables: { luna: lunaActuala }
     });
     setFacturi(result.data.getFacturiLunaCurenta);
   } catch (error) {
     console.error('Error fetching facturi:', error);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchFacturi();
 }, []);

 React.useImperativeHandle(ref, () => ({
   fetchFacturi
 }));

 return (
   <Card className="mt-6">
     <CardHeader>
       <CardTitle>Facturi Luna Curentă</CardTitle>
     </CardHeader>
     <CardContent>
       {loading ? (
         <div className="text-center py-4">Se încarcă...</div>
       ) : (
         <div className="overflow-x-auto">
           <table className="w-full text-sm">
             <thead>
               <tr className="border-b">
                 <th className="text-left p-2">Tip</th>
                 <th className="text-left p-2">Nr. Factură</th>
                 <th className="text-left p-2">Data</th>
                 <th className="text-right p-2">Suma</th>
                 <th className="text-center p-2">Perioadă</th>
                 <th className="text-center p-2">Indexe</th>
                 <th className="text-center p-2">Estimat</th>
               </tr>
             </thead>
             <tbody>
               {facturi.map(factura => (
                 <tr key={factura.id} className="border-b hover:bg-gray-50">
                   <td className="p-2">{factura.tip}</td>
                   <td className="p-2">{factura.numar_factura}</td>
                   <td className="p-2">
                     {new Date(factura.data_factura).toLocaleDateString('ro-RO')}
                   </td>
                   <td className="text-right p-2">
                     {factura.suma.toFixed(2)} RON
                   </td>
                   <td className="text-center p-2">
                     {new Date(factura.perioada_start).toLocaleDateString('ro-RO')} - 
                     {new Date(factura.perioada_end).toLocaleDateString('ro-RO')}
                   </td>
                   <td className="text-center p-2">
                     {factura.tip === 'ENERGIE' && factura.index_vechi && factura.index_nou ? 
                       `${factura.index_vechi} → ${factura.index_nou}` : '-'}
                   </td>
                   <td className="text-center p-2">
                     {factura.estimat ? '✓' : '-'}
                   </td>
                 </tr>
               ))}
               {facturi.length === 0 && (
                 <tr>
                   <td colSpan="7" className="text-center py-4 text-gray-500">
                     Nu există facturi înregistrate pentru luna curentă
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       )}
     </CardContent>
   </Card>
 );
});

const FisaUtilitati = () => {
 const listaFacturiRef = React.useRef();

 const handleFacturaAdaugata = () => {
   if (listaFacturiRef.current) {
     listaFacturiRef.current.fetchFacturi();
   }
 };

 return (
   <div className="space-y-6">
     <AdaugaFacturaForm onFacturaAdaugata={handleFacturaAdaugata} />
     <ListaFacturi ref={listaFacturiRef} />
   </div>
 );
};

export default FisaUtilitati;