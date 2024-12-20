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
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    fetchContracte();
  }, []);

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracte</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracte.map(contract => (
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

                <div className="mt-4 flex gap-2 justify-end">
                 
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