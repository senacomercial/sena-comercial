import { CTAButton, Overline, Highlight } from './Primitives.jsx';
import { asset } from '../utils.js';

function MiniStat({ num, label }) {
  return (
    <div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, fontWeight: 700, color: '#C5A059', letterSpacing: '-.01em' }}>{num}</div>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="hero-section" style={{
      position: 'relative',
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.95) 100%), url(${asset('brand-racing-suit-gold.png')})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <Overline variant="orange">ESCUDERIA DE ESTRUTURAÇÃO COMERCIAL · IMOBILIÁRIAS & PMEs</Overline>
        <h1 style={{
          fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05, letterSpacing: '-.02em',
          margin: '22px 0 20px', color: '#fff', textTransform: 'uppercase',
          maxWidth: 920
        }}>
          Brigamos por cada <Highlight>milésimo de segundo</Highlight> que coloca seu negócio no <Highlight color="gold">topo do pódio.</Highlight>
        </h1>
        <p style={{
          fontFamily: 'Montserrat,sans-serif', fontSize: 18, lineHeight: 1.6,
          color: 'rgba(255,255,255,.78)', margin: '0 0 28px', maxWidth: 620
        }}>
          Estruturamos a sua máquina de vendas com o rigor, a verdade bruta e a precisão de uma escuderia de Elite. Zero enrolação. Resultado cravado em dados.
        </p>

        {/* Banner do webinário */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          padding: '14px 22px', marginBottom: 28,
          background: 'rgba(232,93,4,.12)',
          border: '1px solid rgba(232,93,4,.55)',
          borderLeft: '4px solid #E85D04',
          borderRadius: 4
        }}>
          <span style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 11, fontWeight: 800,
            letterSpacing: '.18em', textTransform: 'uppercase', color: '#E85D04'
          }}>🔴 Webinário ao vivo</span>
          <span style={{
            fontFamily: '"JetBrains Mono",monospace', fontSize: 'clamp(13px,1.6vw,15px)',
            fontWeight: 700, color: '#fff', letterSpacing: '.04em'
          }}>QUI · 07/05 · 19:00</span>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <CTAButton size="lg" href="https://chat.whatsapp.com/LErVTWEuZJZ3EFNlsdDoZZ" icon={<span>💬</span>}>
            Participar do próximo webinário
          </CTAButton>
          <CTAButton size="lg" variant="ghost" onClick={() => document.querySelector('#method')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver o método MaVIS
          </CTAButton>
        </div>
        <div className="hero-stats" style={{ display: 'flex', marginTop: 48, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.1)', flexWrap: 'wrap' }}>
          <MiniStat num="R$ 1.0M" label="fechados com R$ 300" />
          <MiniStat num="5×" label="conversão pós-filtro" />
          <MiniStat num="4h/dia" label="devolvidas ao corretor" />
          <MiniStat num="3" label="pilares MaVIS" />
        </div>
      </div>
    </section>
  );
}
