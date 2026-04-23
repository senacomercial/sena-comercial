import { Overline, Highlight } from './Primitives.jsx';
import { asset } from '../utils.js';

const numbers = [
  { n: 'R$ 303M', l: 'vendidos como corretor' },
  { n: 'R$ 2,1Bi', l: 'em vendas gerenciadas' },
  { n: '50', l: 'projetos atendidos em 2025' },
  { n: '+90', l: 'corretores capacitados' },
  { n: '~15', l: 'anos no mercado imobiliário' },
];

export default function Bio() {
  return (
    <section id="airton" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,.05)' }}>
      <div className="bio-grid">
        {/* LEFT — full-bleed portrait */}
        <div className="bio-photo" style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.85) 100%), url(${asset('airton-portrait.png')})`,
          backgroundSize: 'cover', backgroundPosition: 'center 20%',
          position: 'relative',
          borderRight: '1px solid rgba(197,160,89,.12)'
        }}>
          <div style={{ position: 'absolute', bottom: 'clamp(24px,5vw,36px)', left: 'clamp(20px,5vw,36px)', right: 'clamp(20px,5vw,36px)' }}>
            <Overline variant="gold">PILOTO · FUNDADOR</Overline>
            <div className="bio-name" style={{
              fontFamily: '"Playfair Display",serif', fontWeight: 800,
              lineHeight: .95, letterSpacing: '-.02em',
              color: '#fff', marginTop: 10
            }}>Airton<br />Carneiro</div>
            <div style={{
              fontFamily: '"JetBrains Mono",monospace', fontSize: 11,
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.45)', marginTop: 18
            }}>Sena / piloto da escuderia</div>
          </div>
        </div>

        {/* RIGHT — editorial */}
        <div className="bio-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Overline variant="orange">QUEM PILOTA A ESCUDERIA</Overline>
          <h2 style={{
            fontFamily: '"Playfair Display",serif', fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 56px)', lineHeight: 1.05, letterSpacing: '-.02em',
            margin: '16px 0 20px', color: '#fff', maxWidth: 640
          }}>
            Chamado de <Highlight color="gold">o Sena das vendas imobiliárias</Highlight> pelo método que acelera cada fechamento.
          </h2>
          <p style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(15px,2vw,17px)', lineHeight: 1.7,
            color: 'rgba(255,255,255,.78)', margin: 0, maxWidth: 620
          }}>
            Quase <strong style={{ color: '#fff' }}>15 anos no mercado imobiliário</strong> como corretor, gestor e consultor. Construiu uma metodologia própria — a MaVIS — que reduz o ciclo de fechamento, filtra lead inerte na origem e transforma operações dispersas em máquina auditável.
          </p>
          <p style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 'clamp(15px,2vw,17px)', lineHeight: 1.7,
            color: 'rgba(255,255,255,.78)', margin: '16px 0 0', maxWidth: 620
          }}>
            Hoje a Sena acompanha, por ciclo, um máximo de três mentorados — padrão paddock, não sala de aula.
          </p>

          {/* numbers grid */}
          <div className="bio-numbers" style={{
            marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'grid', maxWidth: 860
          }}>
            {numbers.map((it, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: '"JetBrains Mono",monospace', fontWeight: 700,
                  fontSize: `clamp(22px, 3vw, ${it.n.length > 5 ? 24 : 30}px)`, letterSpacing: '-.02em',
                  color: '#C5A059', lineHeight: 1
                }}>{it.n}</div>
                <div style={{
                  fontFamily: 'Montserrat,sans-serif', fontSize: 11,
                  letterSpacing: '.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.55)', marginTop: 10, lineHeight: 1.35
                }}>{it.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
