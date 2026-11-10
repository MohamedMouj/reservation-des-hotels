import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function MainLayout() {
  return (
    <div>
      <Header/>

      <main style={{ padding: '20px' }}>
        {/* The current page gets injected here */}
        <Outlet /> 
      </main>

      <Footer/>
    </div>
  );
}