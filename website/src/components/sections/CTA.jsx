import React from 'react';
import GradientWaves from '../ui/GradientWaves';
import Shuffle from '../ui/Shuffle';
import { useAuth } from '../../context/AuthContext';
import './sections.css';
const CTA = ({ onNavigate }) => {
const { user } = useAuth();
return (
<section className="cta-section" id="pricing">
<div className="cta-background"><GradientWaves horizonColor="#050606" waveColor="#0f1a13" crestColor="#39ff88" speed={0.2} amplitude={1.5} opacity={0.5} /></div>
<div className="cta-content">
<Shuffle text="Create an account" shuffleDirection="up" duration={0.4} shuffleTimes={2} triggerOnce={true} triggerOnHover={true} tag="h2" textAlign="center" />
<p className="cta-sub">Free while in beta. No card required.</p>
<button className="cta-button primary" onClick={() => { const target = user ? '/dashboard' : '/signup'; onNavigate ? onNavigate(target) : (window.location.href = target); }}>Create Free Account</button>
</div>
</section>
);
};
export default CTA;
