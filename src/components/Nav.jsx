import { useState, useEffect } from 'react';
import { CTAButton } from './Primitives.jsx';
import { asset } from '../utils.js';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className="nav-wrap" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(0,0,0,.75)' : 'rgba(0,0,0,.35)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,.08)' : 'transparent'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
      transition: 'background .2s, border-color .2s'
    }}>
      <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', flexShrink: 0 }}>
        <img src={asset('logo-sena-white-transparent.png')} alt="Sena" style={{ height: 28 }} />
        <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, letterSpacing: '.18em', fontSize: 15 }}>SENA</span>
      </a>
      <div className="nav-links" style={{ gap: 28, fontFamily: 'Montserrat,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>
        <a href="#mechanism" style={{ color: 'inherit', textDecoration: 'none' }}>Mecanismo</a>
        <a href="#method" style={{ color: 'inherit', textDecoration: 'none' }}>Método</a>
        <a href="#proof" style={{ color: 'inherit', textDecoration: 'none' }}>Casos</a>
      </div>
      <CTAButton size="sm" href="https://wa.me/553131578482" icon={<span>💬</span>}>
        Falar no WhatsApp
      </CTAButton>
    </nav>
  );
}
