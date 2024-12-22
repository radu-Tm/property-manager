import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';

const client = generateClient();

const getPlatiPaginated = /* GraphQL */ `
  query GetPlatiPaginated($input: PlatiPaginatedInput!) {
    getPlatiPaginated(input: $input) {
      items {
        id
        data_plata
        suma
        tip
        metoda_plata
        numar_document
        luna_platita
        nota
        chirias_nume
        numar_contract
      }
      totalCount
      pageCount
    }
  }
`;

const Plati = () => {
 const [plati, setPlati] = useState([]);
 const [loading, setLoading] = useState(true);
 const [currentPage, setCurrentPage] = useState(1);
 const [pageCount, setPageCount] = useState(0);
 const [tipPlata, setTipPlata] = useState('');
 const [numeChirias, setNumeChirias] = useState('');
 const { user } = useAuth();
 const { showError } = useNotification();
 const limit = 20;

const fetchPlati = async () => {
    try {
      const result = await client.graphql({
        query: getPlatiPaginated,
        variables: {
          input: {  // acum împachetăm toate variabilele într-un obiect input
            page: currentPage,
            limit,
            email: user.email,
            tipPlata: tipPlata || null,
            numeChirias: numeChirias || null
          }
        }
      });
      
      setPlati(result.data.getPlatiPaginated.items);
      setPageCount(result.data.getPlatiPaginated.pageCount);
    } catch (error) {
      console.error('Error fetching plati:', error);
      showError('Nu s-au putut încărca plățile');
    } finally {
      setLoading(false);
    }
};

 useEffect(() => {
   fetchPlati();
 }, [currentPage, tipPlata, numeChirias]);

 const renderPagination = () => {
   const pages = [];
   for (let i = 1; i <= pageCount; i++) {
     pages.push(
       <Button
         key={i}
         variant={currentPage === i ? "default" : "outline"}
         onClick={() => setCurrentPage(i)}
         className="mx-1"
       >
         {i}
       </Button>
     );
   }

   return (
     <div className="flex justify-center items-center gap-2 mt-4">
       <Button
         variant="outline"
         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
         disabled={currentPage === 1}
       >
         Anterior
       </Button>
       {pages}
       <Button
         variant="outline"
         onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
         disabled={currentPage === pageCount}
       >
         Următor
       </Button>
     </div>
   );
 };

 return (
   <div className="p-8">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Plăți</h1>
       
       <div className="flex gap-4">
         <select
           value={tipPlata}
           onChange={(e) => {
             setTipPlata(e.target.value);
             setCurrentPage(1);
           }}
           className="border rounded p-2"
         >
           <option value="">Toate plățile</option>
           <option value="CHIRIE">Doar chirii</option>
           <option value="UTILITATI">Doar utilități</option>
         </select>

         <input
           type="text"
           value={numeChirias}
           onChange={(e) => {
             setNumeChirias(e.target.value);
             setCurrentPage(1);
           }}
           placeholder="Caută după nume chiriaș"
           className="border rounded p-2"
         />
       </div>
     </div>

     {loading ? (
       <div className="flex justify-center py-8">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
       </div>
     ) : (
       <>
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="bg-gray-50">
                 <th className="text-left p-4">Data Plată</th>
                 <th className="text-left p-4">Chiriaș</th>
                 <th className="text-left p-4">Contract</th>
                 <th className="text-left p-4">Tip</th>
                 <th className="text-right p-4">Sumă</th>
                 <th className="text-left p-4">Metodă</th>
                 <th className="text-left p-4">Document</th>
                 <th className="text-left p-4">Luna plătită</th>
               </tr>
             </thead>
             <tbody>
               {plati.map(plata => (
                 <tr key={plata.id} className="border-b hover:bg-gray-50">
                   <td className="p-4">{new Date(plata.data_plata).toLocaleDateString('ro-RO')}</td>
                   <td className="p-4">{plata.chirias_nume}</td>
                   <td className="p-4">{plata.numar_contract}</td>
                   <td className="p-4">{plata.tip}</td>
                   <td className="p-4 text-right">{plata.suma} {plata.tip === 'CHIRIE' ? 'EUR' : 'RON'}</td>
                   <td className="p-4">{plata.metoda_plata}</td>
                   <td className="p-4">{plata.numar_document}</td>
                   <td className="p-4">{new Date(plata.luna_platita).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         {renderPagination()}
       </>
     )}
   </div>
 );
};

export default Plati;