import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard';
import Header from './components/Header'
// import "react-loader-spinner/dist/loader/css/react-loader-spinner.css";

function App() {
  return (
    <>
    <Header/>
    <Routes>
      <Route exact path="/" element={<Dashboard/>} />
    </Routes>
    </>
  );
}

export default App;
