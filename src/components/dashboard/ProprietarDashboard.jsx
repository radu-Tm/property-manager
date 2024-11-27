import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Bed, Bath, Square, ArrowRight } from 'lucide-react';
import AddPropertyForm from './AddPropertyForm';

const client = generateClient();

// Definim query-ul pentru listare proprietăți
const listProprietati = /* GraphQL */ `
 query ListProprietati {
   listProprietati {
     items {
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
 }
`;

const PropertyCard = ({ proprietate }) => (
 <Card className="w-full hover:shadow-lg transition-shadow">
   <CardHeader>
     <CardTitle className="flex items-center space-x-2">
       <Building2 className="h-5 w-5 text-blue-600" />
       <span>{proprietate.nume}</span>
     </CardTitle>
     <CardDescription>{proprietate.adresa}</CardDescription>
   </CardHeader>
   <CardContent>
     <div className="grid grid-cols-3 gap-4 mb-4">
       <div className="flex items-center space-x-2">
         <Bed className="h-4 w-4 text-gray-500" />
         <span>{proprietate.dormitoare} dormitoare</span>
       </div>
       <div className="flex items-center space-x-2">
         <Bath className="h-4 w-4 text-gray-500" />
         <span>{proprietate.bai} băi</span>
       </div>
       <div className="flex items-center space-x-2">
         <Square className="h-4 w-4 text-gray-500" />
         <span>{proprietate.suprafata} m²</span>
       </div>
     </div>
     <Button variant="outline" className="w-full">
       Vezi detalii
       <ArrowRight className="h-4 w-4 ml-2" />
     </Button>
   </CardContent>
 </Card>
);

const ProprietarDashboard = () => {
 const [proprietati, setProprietati] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showAddForm, setShowAddForm] = useState(false);

 useEffect(() => {
   fetchProprietati();
 }, []);

 const fetchProprietati = async () => {
   try {
     setLoading(true);
     const result = await client.graphql({
       query: listProprietati
     });
     console.log('Proprietăți primite:', result.data.listProprietati.items);
     setProprietati(result.data.listProprietati.items);
   } catch (error) {
     console.error('Error fetching properties:', error);
   } finally {
     setLoading(false);
   }
 };

 if (loading) {
   return (
     <div className="flex justify-center items-center p-8">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
     </div>
   );
 }

 return (
   <div className="p-8">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Proprietățile Mele</h1>
       <Button onClick={() => setShowAddForm(true)}>Adaugă Proprietate</Button>
     </div>
     
     {showAddForm ? (
       <AddPropertyForm
         onSuccess={() => {
           setShowAddForm(false);
           fetchProprietati(); // reîncarcă lista de proprietăți
         }}
         onCancel={() => setShowAddForm(false)}
       />
     ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {proprietati.map((prop) => (
           <PropertyCard key={prop.id} proprietate={prop} />
         ))}
       </div>
     )}
   </div>
 );
};

export default ProprietarDashboard;