

import React, { useState } from 'react';
import UserAgreement from './UserAgreement';
import './WelcomePage.css';

const WelcomePage = ({ onStart }) => {
  const [showAgreement, setShowAgreement] = useState(false);

  const handleStart = () => {
    setShowAgreement(true);
  };

  const handleAgree = () => {
    onStart(); // This will trigger the state change in App.js
  };

  const handleDisagree = () => {
    setShowAgreement(false);
  };

  return (
    <div className="welcome-container">
      <h1 className="app-title">Tongue Capture App</h1>
      <p className="app-description">
         Capture high-quality tongue images for analysis. Follow the guided steps
         to ensure consistency and clarity.
      </p>
      <button onClick={handleStart}>Start</button>
      {showAgreement && (
        <UserAgreement onAgree={handleAgree} onDisagree={handleDisagree} />
      )}
    </div>
  );
};

export default WelcomePage;

