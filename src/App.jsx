// src/App.jsx

import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  console.log("App.jsx: Rendering App with Navbar and AppRoutes");
  return (
    <> 
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20"> 
        <AppRoutes />
      </main>
    </>
  );
}

export default App;
