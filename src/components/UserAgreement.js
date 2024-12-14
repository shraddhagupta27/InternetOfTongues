// UserAgreement.js
import React from 'react';
import './UserAgreement.css';

const UserAgreement = ({ onAgree, onDisagree }) => {
  return (
    <div className="agreement-overlay">
      <div className="agreement-content">
        <h2>User Agreement</h2>
        <p>
          By clicking "Agree", you consent to the collection and use of your images
          for the purposes outlined in our privacy policy. We respect your privacy
          and will handle your data securely.
        </p>
        <div className="agreement-buttons">
          <button onClick={onAgree}>Agree</button>
          <button onClick={onDisagree}>Disagree</button>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
