import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const client = generateClient();

const listContracte = /* GraphQL */ `
  query ListContracte {
    listContracte {
      items {
        id
        IDProprietate
        DataInceput
        DataSfarsit
        ChirieInitiala
        CrestereProcent
        Nota
        proprietate {
          nume
          adresa
        }
      }
    }
  }
`;

const ChiriasDashboard = () => {
  const [contracte, setContracte] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
 

  useEffect(() => {
    fetchContracte();
  }, []);

  const fetchContracte = async () => {
    try {
      setLoading(true);
      const result = await client.graphql({
        query: listContracte
      });
      console.log('Contracte primite:', result.data.listContracte.items);
      setContracte(result.data.listContracte.items);
    } catch (error) {
      console.error('Error fetching contracts:', error);
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
      <h1 className="text-2xl font-bold mb-6">
        Bun venit, {user.email}
      </h1>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contractele Mele</h1>
      <div className="grid gap-6">
        {contracte.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>{contract.proprietate?.nume}</CardTitle>
              </div>
              <CardDescription>{contract.proprietate?.adresa}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      De la: {new Date(contract.DataInceput).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Până la: {new Date(contract.DataSfarsit).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Chirie lunară: {contract.ChirieInitiala} RON
                  </span>
                </div>
                {contract.CrestereProcent > 0 && (
                  <div className="text-sm text-gray-500">
                    Creștere anuală: {contract.CrestereProcent}%
                  </div>
                )}
                <Button variant="outline" className="w-full mt-2">
                  Vezi detalii contract
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {contracte.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nu aveți contracte active în acest moment.
          </div>
        )}
      </div>
    </div>
	</div>
  );
};

export default ChiriasDashboard;