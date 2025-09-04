import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import store from './redux/store.js';
<<<<<<< HEAD
import './index.css';

=======
import { loadUser } from './redux/authSlice.js';
import './index.css';

// Load user if token exists
const token = localStorage.getItem('token');
if (token) {
  store.dispatch(loadUser());
}

>>>>>>> 14f427b2 (second commit)
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
<<<<<<< HEAD
);
=======
);
>>>>>>> 14f427b2 (second commit)
