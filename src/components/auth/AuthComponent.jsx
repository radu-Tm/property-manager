import React, { useState } from 'react';
import { signUp, signIn, confirmSignUp } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const client = generateClient();

const checkChiriasEmail = `
    query CheckChiriasEmail($email: String!) {
        checkChiriasEmail(email: $email) {
            status
            message
        }
    }
`;

export const AuthComponent = (props) => {
  const [authState, setAuthState] = useState('signIn');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: '',
    userType: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSignIn = async (e) => {
  e.preventDefault();
  try {
    await signIn({
      username: formData.email,
      password: formData.password,
    });
    // După autentificare, reîncărcăm pagina în loc să folosim callback-ul
    window.location.reload();
  } catch (err) {
    setError(err.message);
  }
};

const handleSignUp = async (e) => {
    e.preventDefault();
    try {
        if (formData.userType === 'chirias') {
            // Verificăm mai întâi dacă emailul există în sistem
            const checkResponse = await client.graphql({
    query: checkChiriasEmail,
    variables: { email: formData.email }
});

// Verifică dacă răspunsul este corect structurat
if (checkResponse.data.checkChiriasEmail.status === 'NOT_ALLOWED') {
    setNotification({
        type: 'info',
        title: 'Verificare email',
        message: checkResponse.data.checkChiriasEmail.message || 'Emailul nu este permis.',
        className: 'bg-amber-50 border-amber-200'
    });
    return; // Nu mergem mai departe cu înregistrarea
}
        }

        // Doar dacă verificarea e OK sau e proprietar, continuăm cu înregistrarea
        const signUpResponse = await signUp({
            username: formData.email,
            password: formData.password,
            options: {
                userAttributes: {
                    email: formData.email,
                    'custom:userType': formData.userType
                }
            }
        });
        setAuthState('confirmSignUp');
    } catch (err) {
        console.error('SignUp error:', err);
        setError('A apărut o eroare. Vă rugăm să încercați din nou.');
    }
};

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode: formData.code,
      });
      setAuthState('signIn');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderForm = () => {
    switch(authState) {
      case 'signIn':
        return (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parolă</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit" className="w-full">Autentificare</Button>
            <p className="text-center text-sm">
              Nu ai cont?{' '}
              <button 
                type="button"
                onClick={() => setAuthState('signUp')}
                className="text-blue-600 hover:underline"
              >
                Înregistrează-te
              </button>
            </p>
          </form>
        );
      
      case 'signUp':
        return (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parolă</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tip cont <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({...formData, userType: e.target.value})}
                className="w-full p-2 border rounded bg-white"
                required
              >
                <option value="">Selectează tipul de cont</option>
                <option value="chirias">Cont Chiriaș</option>
                <option value="proprietar">Cont Proprietar</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Înregistrare</Button>
            <p className="text-center text-sm">
              Ai deja cont?{' '}
              <button 
                type="button"
                onClick={() => setAuthState('signIn')}
                className="text-blue-600 hover:underline"
              >
                Autentifică-te
              </button>
            </p>
          </form>
        );

      case 'confirmSignUp':
        return (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cod de confirmare</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <Button type="submit" className="w-full">Confirmă înregistrarea</Button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {authState === 'signIn' ? 'Autentificare' : 
             authState === 'signUp' ? 'Înregistrare' : 
             'Confirmă înregistrarea'}
          </CardTitle>
          <CardDescription>
            {authState === 'signIn' ? 'Intră în contul tău' : 
             authState === 'signUp' ? 'Creează un cont nou' : 
             'Introdu codul primit pe email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notification && (
            <div className={`mb-4 p-4 rounded-lg ${notification.className}`}>
              {notification.title && (
                <p className="font-medium">{notification.title}</p>
              )}
              <p>{notification.message}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}
          {renderForm()}
        </CardContent>
      </Card>
    </div>
  );
};