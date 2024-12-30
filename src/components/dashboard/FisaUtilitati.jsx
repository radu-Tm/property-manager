import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../context/AuthContext';

const client = generateClient();

const createFacturaUtilitate = /* GraphQL */ `
  mutation CreateFacturaUtilitate($input: CreateFacturaUtilitateInput!) {
    createFacturaUtilitate(input: $input) {
	  id_cladire
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
   getFacturiLuna(luna: $luna) {
	   id_cladire
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

const getCotePartiFactura = /* GraphQL */ `
  query GetCotePartiFactura($id_factura: ID!) {
    getCotePartiFactura(id_factura: $id_factura) {
      id_contract
      id_factura
      chirias_nume
      suprafata
      numar_persoane
      suprafata_totala
      total_persoane
      suma
      mod_calcul
      consum_individual
      suma_consum
      suma_comune
    }
  }
`;
// Componenta pentru modal cote părți
const CotePartiModal = ({ factura, isOpen, onClose }) => {
  const [coteParti, setCoteParti] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCoteParti = async () => {
    try {
      const response = await client.graphql({
        query: getCotePartiFactura,
        variables: { id_factura: factura.id }
      });
      console.log('Raw response cote parti:', response.data.getCotePartiFactura);
      setCoteParti(response.data.getCotePartiFactura);
    } catch (error) {
      console.error('Error fetching cote parti:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && factura) {
      getCoteParti();
    }
  }, [isOpen, factura]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-[800px] w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Cote Părți - {factura.tip}</h3>
              <p className="text-sm text-gray-500">
                Factura nr. {factura.numar_factura} din {new Date(factura.data_factura).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="mt-4">
              {factura.tip === 'ENERGIE' ? (
                <>
                  {/* Contracte cu contor */}
                  {coteParti.some(cp => cp.mod_calcul === 'contor') && (
                    <>
                      <h4 className="font-semibold mb-2">Plată Contorizată</h4>
                      <table className="w-full mb-4">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3">Chiriaș</th>
                            <th className="text-right p-3">Consum (kW)</th>
                            <th className="text-right p-3">Sumă Consum</th>
                            <th className="text-right p-3">Sumă Comune</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coteParti
                            .filter(cp => cp.mod_calcul === 'contor')
                            .map((cota, index) => (
                              <tr key={`contor-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="p-3">{cota.chirias_nume}</td>
                                <td className="text-right p-3">{cota.consum_individual?.toFixed(2)}</td>
                                <td className="text-right p-3">{cota.suma_consum?.toFixed(2)}</td>
                                <td className="text-right p-3">{cota.suma_comune?.toFixed(2)}</td>
                                <td className="text-right p-3">{cota.suma.toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* Contracte la paușal */}
                  {coteParti.some(cp => cp.mod_calcul === 'suprafata') && (
                    <>
                      <h4 className="font-semibold mb-2">Plată Paușală</h4>
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3">Chiriaș</th>
                            <th className="text-right p-3">Suprafață</th>
                            <th className="text-right p-3">Total Suprafață</th>
                            <th className="text-right p-3">Sumă</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coteParti
                            .filter(cp => cp.mod_calcul === 'suprafata')
                            .map((cota, index) => (
                              <tr key={`pausal-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="p-3">{cota.chirias_nume}</td>
                                <td className="text-right p-3">{cota.suprafata}</td>
                                <td className="text-right p-3">{cota.suprafata_totala}</td>
                                <td className="text-right p-3">{cota.suma.toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Chiriaș</th>
                      <th className="text-right p-3">
                        {['GAZ', 'ENERGIE'].includes(factura.tip) ? 'Suprafață' : 'Nr. Persoane'}
                      </th>
                      <th className="text-right p-3">
                        {['GAZ', 'ENERGIE'].includes(factura.tip) ? 'Total Suprafață' : 'Total Persoane'}
                      </th>
                      <th className="text-right p-3">Sumă</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coteParti.map((cota, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3">{cota.chirias_nume}</td>
                        <td className="text-right p-3">
                          {cota.mod_calcul === 'suprafata' ? cota.suprafata : cota.numar_persoane}
                        </td>
                        <td className="text-right p-3">
                          {cota.mod_calcul === 'suprafata' ? cota.suprafata_totala : cota.total_persoane}
                        </td>
                        <td className="text-right p-3">{cota.suma.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Total general */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{coteParti.reduce((sum, cp) => sum + cp.suma, 0).toFixed(2)} RON</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdaugaFacturaForm = ({ onSuccess }) => {
  const [cladiri, setCladiri] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    id_cladire: '3',
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

  useEffect(() => {
   const fetchCladiri = async () => {
  try {
    const result = await client.graphql({
      query: listCladiri,
      variables: { email: user.email }
    });
    
    if (result.data?.listCladiri?.items) {
      setCladiri(result.data.listCladiri.items);
    } else {
      console.error('No items in response:', result);
    }
  } catch (error) {
    console.error('Error fetching cladiri:', error);
  }
};

    fetchCladiri();
  }, [user.email]);

 //const [loading, setLoading] = useState(false);
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
		 id_cladire: formData.id_cladire,
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

       // console.log('Input being sent:', input); // Pentru debug

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
	   id_cladire: '',
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
     onSuccess?.();
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
         {/* Selector clădire - apare doar dacă sunt mai multe clădiri */}
         {cladiri.length > 1 && (
           <div className="md:col-span-2">
             <label className="block text-sm font-medium mb-1">Clădire*</label>
             <select
               value={formData.id_cladire}
               onChange={(e) => setFormData({...formData, id_cladire: e.target.value})}
               className="w-full p-2 border rounded bg-white"
               required
             >
               <option value="">Selectează clădirea</option>
               {cladiri.map(cladire => (
                 <option key={cladire.id} value={cladire.id}>{cladire.nume}</option>
               ))}
             </select>
           </div>
         )}

         <div>
           <label className="block text-sm font-medium mb-1">Data Factură*</label>
           <input
             type="date"
             value={formData.data_factura}
             onChange={(e) => setFormData({...formData, data_factura: e.target.value})}
             className="w-full p-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Tip Utilitate*</label>
           <select
             value={formData.tip}
             onChange={(e) => setFormData({...formData, tip: e.target.value})}
             className="w-full p-2 border rounded bg-white"
             required
           >
             <option value="RETIM">RETIM</option>
             <option value="AQUATIM">AQUATIM</option>
             <option value="GAZ">GAZ</option>
             <option value="ENERGIE">ENERGIE</option>
             <option value="CURATENIE">CURATENIE</option>
             <option value="CONSUMABILE">CONSUMABILE</option>
           </select>
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Număr Factură*</label>
           <input
             type="text"
             value={formData.numar_factura}
             onChange={(e) => setFormData({...formData, numar_factura: e.target.value})}
             className="w-full p-2 border rounded"
             required
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Sumă*</label>
           <input
             type="number"
             step="0.01"
             value={formData.suma}
             onChange={(e) => setFormData({...formData, suma: e.target.value})}
             className="w-full p-2 border rounded"
             required
           />
         </div>

         {/* Perioada de consum - opțională */}
         <div>
           <label className="block text-sm font-medium mb-1">Perioada Start</label>
           <input
             type="date"
             value={formData.perioada_start}
             onChange={(e) => setFormData({...formData, perioada_start: e.target.value})}
             className="w-full p-2 border rounded"
           />
         </div>

         <div>
           <label className="block text-sm font-medium mb-1">Perioada End</label>
           <input
             type="date"
             value={formData.perioada_end}
             onChange={(e) => setFormData({...formData, perioada_end: e.target.value})}
             className="w-full p-2 border rounded"
           />
         </div>

         {/* Indexe pentru ENERGIE */}
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
   const [selectedFactura, setSelectedFactura] = useState(null);

 const fetchFacturi = async () => {
   try {
     const lunaActuala = new Date().toISOString().slice(0, 7);
     const result = await client.graphql({
       query: getFacturiLunaCurenta,
       variables: { luna: lunaActuala }
     });
     setFacturi(result.data.getFacturiLuna);
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
                 <th className="text-center p-2">Indecşi</th>
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
				   <td> <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFactura(factura)}
                >
                  Vezi cote părți
                </Button></td>
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
	    {selectedFactura && (
        <CotePartiModal 
          factura={selectedFactura}
          isOpen={!!selectedFactura}
          onClose={() => setSelectedFactura(null)}
        />
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
     <AdaugaFacturaForm onSuccess={handleFacturaAdaugata} />
     <ListaFacturi ref={listaFacturiRef} />
   </div>
 );
};

export default FisaUtilitati;