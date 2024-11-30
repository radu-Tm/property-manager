import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Bell, AlertCircle } from 'lucide-react';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const getExpiringContracts = /* GraphQL */ `
  query GetExpiringContracts {
    getExpiringContracts {
      id
      numar_contract
      DataSfarsit
      proprietate {
        nume
        adresa
      }
      chirias {
        nume
      }
    }
  }
`;

const NotificationsPanel = () => {
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiringContracts();
  }, []);

  const fetchExpiringContracts = async () => {
    try {
      const result = await client.graphql({
        query: getExpiringContracts
      });
      setExpiringContracts(result.data.getExpiringContracts);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          Notificări
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringContracts.map(contract => (
              <div 
                key={contract.id} 
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Contract expiră în curând: {contract.numar_contract}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proprietate: {contract.proprietate.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Chiriaș: {contract.chirias.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Data expirării: {new Date(contract.DataSfarsit).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}
            {expiringContracts.length === 0 && (
              <p className="text-gray-500 text-center py-2">
                Nu există notificări în acest moment
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;