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
        fisier_key
        DataColectarii
        data_expirare
        nota
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
  console.log('Starting download for:', doc);
  try {
    if (!doc.fisier_key) {
      showError('Nu există fișier atașat pentru acest document.');
      return;
    }

    console.log('Attempting to download with key:', doc.fisier_key);
    
    // Obținem URL-ul de download direct
    //const url = await downloadData({
    //  key: doc.fisier_key,
    //  options: {
    //    accessLevel: 'guest' // sau 'private' în funcție de configurația ta
    //  }
    //});
const url = 'https://propertymanager7b909536351f4ea8bce232dd987cdc8a67e43-test.s3.us-east-1.amazonaws.com/public/'+doc.fisier_key
    // Deschidem URL-ul într-o nouă fereastră sau facem download direct
    //window.open(url, '_blank');
    // SAU
     window.location.href = url;

    showSuccess('Fișier descărcat cu succes!');
  } catch (error) {
    console.error('Download error:', error);
    showError('Eroare la descărcarea fișierului: ' + error.message);
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
    </div>
  );
}

export default PropertyDetails;