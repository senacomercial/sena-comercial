import { useState, useEffect } from 'react';
import { CTAButton } from './Primitives.jsx';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(0,0,0,.75)' : 'rgba(0,0,0,.35)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,.08)' : 'transparent'}`,
      padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background .2s, border-color .2s'
    }}>
      <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
        <img src="/assets/logo-sena-white-transparent.png" alt="Sena" style={{ height: 32 }} />
        <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, letterSpacing: '.18em', fontSize: 16 }}>SENA</span>
      </a>
      <div style={{ display: 'flex', gap: 28, fontFamily: 'Montserrat,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>
        <a href="#mechanism" style={{ color: 'inherit', textDecoration: 'none' }}>Mecanismo</a>
        <a href="#method" style={{ color: 'inherit', textDecoration: 'none' }}>Método</a>
        <a href="#proof" style={{ color: 'inherit', textDecoration: 'none' }}>Casos</a>
        <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Mentoria</a>
      </div>
      <CTAButton size="sm" onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
        Agendar diagnóstico
      </CTAButton>
    </nav>
  );
}
