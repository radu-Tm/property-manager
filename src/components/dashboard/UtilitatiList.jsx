import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardHeader, CardContent } from '../ui/card';

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

const UtilitatiList = ({ id_cladire, luna }) => {
  const [utilitati, setUtilitati] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    <div>
                      {factura.index_vechi !== undefined && (
                        <span className="text-sm text-gray-600">
                          Index: {factura.index_vechi} → {factura.index_nou}
                        </span>
                      )}
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
      </CardContent>
    </Card>
  );
};

export default UtilitatiList;