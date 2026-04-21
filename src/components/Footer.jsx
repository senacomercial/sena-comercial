import { asset } from '../utils.js';

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C5A059', marginBottom: 14 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(l => (
          <li key={l}>
            <a href="#" style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '56px 32px 32px', background: '#000' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <img src={asset('wolf-mark-white-transparent.png')} alt="" style={{ height: 40 }} />
            <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, letterSpacing: '.2em', fontSize: 18, color: '#fff' }}>SENA</span>
          </div>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, maxWidth: 260 }}>
            Escuderia de estruturação comercial. Verdade crua, telemetria fria, pódio no fim da pista.
          </div>
        </div>
        <FooterCol title="Mecanismo" links={['Lead Inerte', 'Filtro Pós-Clique', 'Score de Intenção', 'Sequestro de Atenção']} />
        <FooterCol title="Mentoria" links={['Estruturação Diagnóstica', 'Grupo', 'Implantação Completa', 'FAQ']} />
        <FooterCol title="Contato" links={['Airton Carneiro', 'WhatsApp', 'Agendar call', 'Instagram']} />
      </div>
      <div style={{ maxWidth: 1100, margin: '48px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em' }}>
        <div>© 2026 SENA COMERCIAL · EXPANSÃO COMERCIAL</div>
        <div>v1.0 · BRANDBOOK OFICIAL</div>
      </div>
    </footer>
  );
}
