import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Receipt, Pencil, Trash2, HandCoins } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
//import GenerareAnexa from './GenerareAnexa';  // Dacă vrem să refolosim componenta

const client = generateClient();

const getAllContracte = /* GraphQL */ `
  query GetAllContracte($email: String!) {
    getAllContracte(email: $email) {
      id
      numar_contract
      DataInceput
      DataSfarsit
      CrestereProcent
      ChirieInitiala
      plata_curent
      numar_persoane
      termen_plata
      numar_locuri_parcare
      chirias {
        id
        nume
      }
      proprietate {
        nume
        adresa
      }
    }
  }
`;

const Contracte = () => {
 const [contracte, setContracte] = useState([]);
 const [loading, setLoading] = useState(true);
 const { user } = useAuth();
 const { showSuccess, showError } = useNotification();
 
 // State pentru filtrare sortare si cautare
 const [statusFiltru, setStatusFiltru] = useState('toate');
 const [sortCriteriu, setSortCriteriu] = useState('data');
const [searchTerm, setSearchTerm] = useState('');
 // Filtrare contracte
 const contracteFiltrate = contracte.filter(contract => {
  // Mai întâi filtrăm după status
  const statusFilter = statusFiltru === 'toate' ? true : 
    statusFiltru === 'active' ? 
      new Date(contract.DataSfarsit) >= new Date() : 
      new Date(contract.DataSfarsit) < new Date();

  // Apoi filtrăm după termenul de căutare
  const searchFilter = contract.chirias?.nume.toLowerCase()
    .includes(searchTerm.toLowerCase());

  return statusFilter && searchFilter;
});

 // Sortare contracte
 const contracteSortate = [...contracteFiltrate].sort((a, b) => {
   switch (sortCriteriu) {
     case 'data':
       return new Date(b.DataInceput) - new Date(a.DataInceput);
     case 'chirie':
       return b.ChirieInitiala - a.ChirieInitiala;
     case 'chirias':
       return a.chirias.nume.localeCompare(b.chirias.nume);
     default:
       return 0;
   }
 });

const fetchContracte = async () => {
  try {
    const result = await client.graphql({
      query: getAllContracte,
      variables: { email: user.email }
    });

    setContracte(result.data.getAllContracte);
  } catch (error) {
    console.error('Error fetching contracte:', error);
    showError('Nu s-au putut încărca contractele');
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
    fetchContracte();
}, []);

   return (
   <div className="p-8">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Contracte</h1>
       
       {/* Filtre și sortare */}
      <div className="flex gap-4">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Caută după nume chiriaș"
    className="border rounded p-2"
  />
  <select
    value={statusFiltru}
    onChange={(e) => setStatusFiltru(e.target.value)}
    className="border rounded p-2"
  >
    <option value="toate">Toate contractele</option>
    <option value="active">Contracte active</option>
    <option value="expirate">Contracte expirate</option>
  </select>
  <select
    value={sortCriteriu}
    onChange={(e) => setSortCriteriu(e.target.value)}
    className="border rounded p-2"
  >
    <option value="data">Sortare după dată</option>
    <option value="chirie">Sortare după chirie</option>
    <option value="chirias">Sortare după chiriaș</option>
  </select>
</div>

     </div>

     {loading ? (
       <div className="flex justify-center py-8">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
       </div>
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {contracteSortate.map(contract => (
           <Card key={contract.id} className="border shadow-sm">
             <CardContent className="p-4">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div>
                   <p className="text-sm font-medium text-gray-500">Nr. Contract</p>
                   <p className="font-medium">{contract.numar_contract}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Chiriaș</p>
                   <p className="font-medium">{contract.chirias?.nume}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Proprietate</p>
                   <p className="font-medium">{contract.proprietate.nume}</p>
                   <p className="text-sm text-gray-500">{contract.proprietate.adresa}</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Perioadă</p>
                   <p className="font-medium">
                     {new Date(contract.DataInceput).toLocaleDateString('ro-RO')} - {' '}
                     {new Date(contract.DataSfarsit).toLocaleDateString('ro-RO')}
                   </p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Chirie Lunară</p>
                   <p className="font-medium">{contract.ChirieInitiala} EUR</p>
                 </div>
                 <div>
                   <p className="text-sm font-medium text-gray-500">Creștere Anuală</p>
                   <p className="font-medium">{contract.CrestereProcent}%</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
     )}
   </div>
 );
};

export default Contracte;