import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Home, Users, Receipt, FileText } from 'lucide-react';

const client = generateClient();

const getProprietate = /* GraphQL */ `
  query GetProprietate($id: ID!) {
    getProprietate(id: $id) {
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
      contracte {
        id
        DataInceput
        DataSfarsit
        ChirieInitiala
      }
      chiriiColectate {
        data
        suma
      }
      documenteProprietate {
        id
        nume
        DataColectarii
      }
      inspectii {
        id
        data
        nume_item
        suma
      }
    }
  }
`;

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const result = await client.graphql({
        query: getProprietate,
        variables: { id }
      });
      setProperty(result.data.getProprietate);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Nu s-au putut încărca detaliile proprietății');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        {error}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-4 text-gray-600">
        Nu s-a găsit proprietatea
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          {property.nume}
        </h1>
        <p className="text-gray-600 mt-2">{property.adresa}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detalii generale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Informații Generale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Tip</dt>
                <dd>{property.tip}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Număr Clădire</dt>
                <dd>{property.NumarCladire}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Nivel</dt>
                <dd>{property.nivel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Dormitoare</dt>
                <dd>{property.dormitoare}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Băi</dt>
                <dd>{property.bai}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Suprafață</dt>
                <dd>{property.suprafata} m²</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Contracte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contracte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.contracte?.length > 0 ? (
              <div className="space-y-4">
                {property.contracte.map(contract => (
                  <div key={contract.id} className="p-4 border rounded">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Data început</span>
                      <span>{new Date(contract.DataInceput).toLocaleDateString('ro-RO')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chirie</span>
                      <span>{contract.ChirieInitiala} RON</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nu există contracte active</p>
            )}
          </CardContent>
        </Card>

        {/* Plăți */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Istoric Plăți
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.chiriiColectate?.length > 0 ? (
              <div className="space-y-2">
                {property.chiriiColectate.map((plata, index) => (
                  <div key={index} className="flex justify-between p-2 border-b">
                    <span>{new Date(plata.data).toLocaleDateString('ro-RO')}</span>
                    <span className="font-medium">{parseFloat(plata.suma).toFixed(2)} RON</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nu există plăți înregistrate</p>
            )}
          </CardContent>
        </Card>

        {/* Documente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.documenteProprietate?.length > 0 ? (
              <div className="space-y-2">
                {property.documenteProprietate.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{doc.nume}</span>
                    <Button variant="outline" size="sm">Vezi</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nu există documente atașate</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyDetails;