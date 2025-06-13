"use client";

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RegisterCandidate from '../../components/RegisterCandidate';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <RegisterCandidate/>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
