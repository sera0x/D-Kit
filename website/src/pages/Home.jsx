import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import TerminalDemo from '../components/sections/TerminalDemo';
import CTA from '../components/sections/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <TerminalDemo />
      <CTA />
    </>
  );
}
