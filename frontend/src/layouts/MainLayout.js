import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function MainLayout() {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: '0 auto', maxWidth: '1200px' }}>
      <Header/>

      <main style={{ padding: '20px' }}>
        {/* The current page gets injected here */}
        <Outlet /> 
      </main>

      <Footer/>
    </div>
  );
}