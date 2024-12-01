import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Bell, AlertCircle, CreditCard, FileText } from 'lucide-react';
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

const getPaymentDueAlerts = /* GraphQL */ `
  query GetPaymentDueAlerts {
    getPaymentDueAlerts {
      id
      numar_contract
      termen_plata
      ChirieInitiala
      zileRamase
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

const getExpiringDocuments = /* GraphQL */ `
  query GetExpiringDocuments {
    getExpiringDocuments {
      id
      nume
      data_expirare
      zileRamase
      proprietate {
        nume
        adresa
      }
    }
  }
`;

const NotificationsPanel = () => {
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [paymentAlerts, setPaymentAlerts] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAlerts();
  }, []);

  const fetchAllAlerts = async () => {
    try {
      const [contractsResult, paymentsResult, documentsResult] = await Promise.all([
        client.graphql({ query: getExpiringContracts }),
        client.graphql({ query: getPaymentDueAlerts }),
        client.graphql({ query: getExpiringDocuments })
      ]);

      setExpiringContracts(contractsResult.data.getExpiringContracts);
      setPaymentAlerts(paymentsResult.data.getPaymentDueAlerts);
      setExpiringDocuments(documentsResult.data.getExpiringDocuments);
    } catch (error) {
      console.error('Error fetching alerts:', error);
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
            {/* Contracte care expiră */}
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

            {/* Alerte plăți */}
            {paymentAlerts.map(alert => (
              <div 
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Plată scadentă: Contract {alert.numar_contract}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proprietate: {alert.proprietate.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Chiriaș: {alert.chirias.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Sumă: {alert.ChirieInitiala} RON
                  </p>
                  <p className="text-sm text-gray-600">
                    Termen: {alert.zileRamase} {alert.zileRamase === 1 ? 'zi' : 'zile'} rămase
                  </p>
                </div>
              </div>
            ))}

            {/* Documente care expiră */}
            {expiringDocuments.map(doc => (
              <div 
                key={doc.id}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <FileText className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    Document expiră în curând: {doc.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proprietate: {doc.proprietate.nume}
                  </p>
                  <p className="text-sm text-gray-600">
                    Data expirării: {new Date(doc.data_expirare).toLocaleDateString('ro-RO')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {doc.zileRamase} {doc.zileRamase === 1 ? 'zi rămasă' : 'zile rămase'}
                  </p>
                </div>
              </div>
            ))}

            {expiringContracts.length === 0 && paymentAlerts.length === 0 && expiringDocuments.length === 0 && (
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