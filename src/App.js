import './App.css';
import React, { useEffect, useState } from 'react';
import Home from './page/home';
import Auth from './page/auth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) setCurrentUser(saved);
  }, []);

  function handleAuthenticated(username) {
    setCurrentUser(username);
  }

  function handleLogout() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_user_name');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
  }

  if (!currentUser) {
    return (
      <div className="App">
        <Auth onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  return (
    <div className="App">
      <Home currentUser={currentUser} onLogout={handleLogout} />
    </div>
  );
}

export default App;
