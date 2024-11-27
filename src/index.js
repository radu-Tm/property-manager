import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
//import { graphqlOperation } from 'aws-amplify';

//import { listProperties } from './graphql/queries'; // sau alte queries specifice

import awsmobile from './aws-exports';  // fișierul generat de Amplify

Amplify.configure(awsmobile);  // inițializarea configurării Amplify

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


