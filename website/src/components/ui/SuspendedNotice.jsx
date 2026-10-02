import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SuspendedNotice({ onNavigate }) {
  const { logout } = useAuth();
  return (
    <div className="suspended-wrap">
      <div className="suspended-card">
        <p className="suspended-kicker">status: suspended</p>
        <h1>Account suspended</h1>
        <p>Your account has been suspended. If you think this is a mistake, contact support.</p>
        <button className="cta-button ghost" onClick={() => { logout(); onNavigate('/'); }}>
          back to home
        </button>
      </div>
    </div>
  );
}
