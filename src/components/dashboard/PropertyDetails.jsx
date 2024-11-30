import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Home, Users, Receipt, FileText, ClipboardCheck } from 'lucide-react';
import EditPropertyForm from './EditPropertyForm';
import { useNotification } from '../../hooks/useNotification';
import AddDocumentForm from './AddDocumentForm';
import { downloadData } from 'aws-amplify/storage';
import { Download } from 'lucide-react';
import { getUrl } from 'aws-amplify/storage';
import AddContractForm from './AddContractForm';
import { Pencil, Trash2 } from 'lucide-react';
import EditContractForm from './EditContractForm';

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
        numar_contract
        DataInceput
        DataSfarsit
        Durata
        CrestereProcent
        ChirieInitiala
        plata_curent
        numar_persoane
        termen_plata
        numar_locuri_parcare
        Nota
        chirias {
          id
          nume
          email
        }
      }
    }
  }
`;

const deleteProprietate = /* GraphQL */ `
  mutation DeleteProprietate($id: ID!) {
    deleteProprietate(id: $id) {
      id
      nume
      tip
      adresa
    }
  }
`;

const deleteContract = /* GraphQL */ `
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id) {
      id
    }
  }
`;

// Definim componenta ca o funcție, nu ca o constantă
function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification(); // Folosim direct funcțiile din hook
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddContract, setShowAddContract] = useState(false);
  const [showEditContract, setShowEditContract] = useState(false);
const [selectedContract, setSelectedContract] = useState(null);
const [showDeleteConfirmContract, setShowDeleteConfirmContract] = useState(false);
const [contractToDelete, setContractToDelete] = useState(null);

const handleEditContract = (contract) => {
  setSelectedContract(contract);
  setShowEditContract(true);
};

const handleDeleteContract = (contractId) => {
  setContractToDelete(contractId);
  setShowDeleteConfirmContract(true);
};
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

  const handleDelete = async () => {
    try {
      await client.graphql({
        query: deleteProprietate,
        variables: { id }
      });
      showSuccess("Proprietatea a fost ștearsă cu succes!"); // Folosim showSuccess
      navigate('/');
    } catch (error) {
      console.error('Error deleting property:', error);
      showError('Nu s-a putut șterge proprietatea. Vă rugăm încercați din nou.'); // Folosim showError
    }
  };
  
const handleDownload = async (doc) => {
  try {
    const { url } = await getUrl({
      key: doc.fisier_key,
      options: {
        expiresIn: 3600 // URL valid pentru o oră
      }
    });
    window.location.href = url;
    showSuccess('Descărcare inițiată');
  } catch (error) {
    console.error('Download error:', error);
    showError('Eroare la descărcare');
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            {property.nume}
          </h1>
          <p className="text-gray-600 mt-2">{property.adresa}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditForm(true)}
          >
            Editează
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Șterge
          </Button>
        </div>
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
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Contracte
      </CardTitle>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowAddContract(true)}
      >
        Adaugă Contract
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {property.contracte?.length > 0 ? (
      <div className="space-y-4">
        {property.contracte.map(contract => (
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
                  <p className="text-sm font-medium text-gray-500">Perioadă</p>
                  <p className="font-medium">
                    {new Date(contract.DataInceput).toLocaleDateString('ro-RO')} - {' '}
                    {new Date(contract.DataSfarsit).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Chirie Lunară</p>
                  <p className="font-medium">{contract.ChirieInitiala} RON</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Creștere Anuală</p>
                  <p className="font-medium">{contract.CrestereProcent}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Termen Plată</p>
                  <p className="font-medium">Ziua {contract.termen_plata}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nr. Persoane</p>
                  <p className="font-medium">{contract.numar_persoane}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plată Curent</p>
                  <p className="font-medium">{contract.plata_curent === 'pausal' ? 'Paușal' : 'Contor'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Locuri Parcare</p>
                  <p className="font-medium">{contract.numar_locuri_parcare}</p>
                </div>
              </div>
			  
			  <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
  <Button 
    variant="outline"
    size="sm"
    onClick={() => handleEditContract(contract)}
  >
    <Pencil className="h-4 w-4 mr-1" />
    Editează
  </Button>
  <Button 
    variant="destructive"
    size="sm"
    onClick={() => handleDeleteContract(contract.id)}
  >
    <Trash2 className="h-4 w-4 mr-1" />
    Șterge
  </Button>
</div>
			  
              {contract.Nota && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Notă</p>
                  <p className="text-sm mt-1">{contract.Nota}</p>
                </div>
              )}
            </CardContent>
          </Card>
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
              <span className="font-medium">{plata.suma} RON</span>
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
    <div className="flex justify-between items-center">
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Documente
      </CardTitle>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowAddDocument(true)}
      >
        Adaugă Document
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {property.documenteProprietate?.length > 0 ? (
  <div className="space-y-2">
    {property.documenteProprietate.map(doc => {
      console.log('Rendering document:', doc); // Log pentru fiecare document
      return (
        <div key={doc.id} className="flex justify-between items-center p-2 border rounded">
          <span>{doc.nume}</span>
         <Button 
  variant="outline" 
  size="sm"
  onClick={() => handleDownload(doc)}
  disabled={!doc.fisier_key}
  className="cursor-pointer hover:bg-gray-100" // adăugăm și astea pentru vizibilitate
>
  <Download className="h-4 w-4 mr-2" />
  Descarcă
</Button>
        </div>
      );
    })}
  </div>
) : (
  <p className="text-gray-500">Nu există documente atașate</p>
)}
  </CardContent>
</Card>
</div>


      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmare ștergere</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Sigur doriți să ștergeți această proprietate? Acțiunea este ireversibilă.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Anulează
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Șterge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
{showAddDocument && (
    <AddDocumentForm
      propertyId={id}
      onClose={() => setShowAddDocument(false)}
      onSuccess={() => {
        setShowAddDocument(false);
        fetchPropertyDetails(); // Reîncarcă detaliile proprietății
      }}
    />
  )}
      {showEditForm && (
        <EditPropertyForm
          property={property}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchPropertyDetails();
          }}
        />
      )}
{showAddContract && (
  <AddContractForm
    propertyId={id}
    onClose={() => setShowAddContract(false)}
    onSuccess={() => {
      setShowAddContract(false);
      fetchPropertyDetails(); // Reîncarcă detaliile proprietății
    }}
  />
)}	  

{showEditContract && selectedContract && (
  <EditContractForm
    contract={selectedContract}
    onClose={() => setShowEditContract(false)}
    onSuccess={() => {
      setShowEditContract(false);
      fetchPropertyDetails();
    }}
  />
)}

{showDeleteConfirmContract && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Confirmare ștergere</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Sigur doriți să ștergeți acest contract? Acțiunea este ireversibilă.</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirmContract(false)}
          >
            Anulează
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await client.graphql({
                  query: deleteContract,
                  variables: { id: contractToDelete }
                });
                showSuccess('Contractul a fost șters cu succes!');
                setShowDeleteConfirmContract(false);
                fetchPropertyDetails();
              } catch (error) {
                console.error('Error deleting contract:', error);
                showError('Nu s-a putut șterge contractul');
              }
            }}
          >
            Șterge
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}

    </div>
  );
}

export default PropertyDetails;