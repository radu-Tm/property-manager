import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button'; 


const client = generateClient();
const getUtilitatiCladire = /* GraphQL */ `
  query GetUtilitatiCladire($id_cladire: ID!, $luna: String!) {
    getUtilitatiCladire(id_cladire: $id_cladire, luna: $luna) {
      id
      tip
      luna
      suma_totala
      index_vechi
      index_nou
    }
  }
`;

const getCotePartiFactura = /* GraphQL */ `
  query GetCotePartiFactura($id_factura: ID!) {
    getCotePartiFactura(id_factura: $id_factura) {
      id_contract
      id_factura
      suma
      mod_calcul
      chirias_nume
    }
  }
`;

// Componenta pentru modal cote părți
const CotePartiModal = ({ factura, isOpen, onClose }) => {
  const [coteParti, setCoteParti] = useState([]);
  
  useEffect(() => {
    if (isOpen && factura) {
      //console.log('Factura primită:', factura);
      getCoteParti();
    }
  }, [isOpen, factura]);

  const getCoteParti = async () => {
    try {
      const response = await client.graphql({
        query: getCotePartiFactura,
        variables: { id_factura: factura.id }
      });
      //console.log('Response cote parti:', response.data.getCotePartiFactura);
      setCoteParti(response.data.getCotePartiFactura);
    } catch (error) {
      console.error('Error fetching cote parti:', error);
    }
   finally {
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
              <p className="text-sm text-gray-500 mt-1">
                Mod calcul: {coteParti[0]?.mod_calcul === 'suprafata' ? 'După suprafață' : 'După număr persoane'}
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
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Chiriaș</th>
                    <th className="text-right p-3">Procent</th>
                    <th className="text-right p-3">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  {coteParti.map((cota, index) => (
                    <tr key={cota.id_contract} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-3">{cota.chirias_nume}</td>
                      <td className="text-right p-3">
                        {((cota.suma / factura.suma) * 100).toFixed(2)}%
                      </td>
                      <td className="text-right p-3">{cota.suma.toFixed(2)} RON</td>
                    </tr>
                  ))}
                  <tr className="font-semibold border-t">
                    <td className="p-3">TOTAL</td>
                    <td className="text-right p-3">100%</td>
                    <td className="text-right p-3">{factura.suma.toFixed(2)} RON</td>
                  </tr>
                </tbody>
              </table>
			  
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const UtilitatiList = ({ id_cladire, luna }) => {
  const [utilitati, setUtilitati] = useState([]);
  const [loading, setLoading] = useState(true);
   const [selectedFactura, setSelectedFactura] = useState(null);

  // Grupăm utilitățile după tip pentru afișare
  const utilitatiGrupate = utilitati.reduce((acc, utilitate) => {
    if (!acc[utilitate.tip]) {
      acc[utilitate.tip] = [];
    }
    acc[utilitate.tip].push(utilitate);
    return acc;
  }, {});

  useEffect(() => {
    fetchUtilitati();
  }, [id_cladire, luna]);

  const fetchUtilitati = async () => {
    try {
      const result = await client.graphql({
        query: getUtilitatiCladire,
        variables: { id_cladire, luna }
      });
      setUtilitati(result.data.getUtilitatiCladire);
    } catch (error) {
      console.error('Error fetching utilitati:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Facturi Înregistrate</h3>
        <p className="text-sm text-gray-500">
          Luna: {new Date(luna + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
        </p>
      </CardHeader>
     <CardContent>
  {loading ? (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : (
    <div className="space-y-4">
      {Object.entries(utilitatiGrupate).map(([tip, factUri]) => (
        <div key={tip} className="border rounded p-4">
          <h4 className="font-medium mb-2">{tip}</h4>
          {factUri.map(factura => (
            <div key={factura.id} className="flex justify-between items-center py-2 border-t first:border-t-0">
              <div className="flex items-center gap-4">
                {factura.index_vechi !== undefined && (
                  <span className="text-sm text-gray-600">
                    Index: {factura.index_vechi} → {factura.index_nou}
                  </span>
                )}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFactura(factura)}
                >
                  Vezi cote părți
                </Button>
              </div>
              <span className="font-medium">{factura.suma_totala} RON</span>
            </div>
          ))}
        </div>
      ))}
      {utilitati.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Nu există facturi înregistrate pentru această lună
        </div>
      )}
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
};

export default UtilitatiList;