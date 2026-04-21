import { Overline, Highlight } from './Primitives.jsx';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,520px) 1fr', minHeight: 720 }}>
        {/* LEFT — full-bleed portrait */}
        <div style={{
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.85) 100%), url(/assets/airton-portrait.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 20%',
          position: 'relative',
          borderRight: '1px solid rgba(197,160,89,.12)'
        }}>
          <div style={{ position: 'absolute', bottom: 36, left: 36, right: 36 }}>
            <Overline variant="gold">PILOTO · FUNDADOR</Overline>
            <div style={{
              fontFamily: '"Playfair Display",serif', fontWeight: 800,
              fontSize: 54, lineHeight: .95, letterSpacing: '-.02em',
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
        <div style={{ padding: '100px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Overline variant="orange">QUEM PILOTA A ESCUDERIA</Overline>
          <h2 style={{
            fontFamily: '"Playfair Display",serif', fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-.02em',
            margin: '16px 0 20px', color: '#fff', maxWidth: 640
          }}>
            Chamado de <Highlight color="gold">o Sena das vendas imobiliárias</Highlight> pelo método que acelera cada fechamento.
          </h2>
          <p style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 17, lineHeight: 1.7,
            color: 'rgba(255,255,255,.78)', margin: 0, maxWidth: 620
          }}>
            Quase <strong style={{ color: '#fff' }}>15 anos no mercado imobiliário</strong> como corretor, gestor e consultor. Construiu uma metodologia própria — a MaVIS — que reduz o ciclo de fechamento, filtra lead inerte na origem e transforma operações dispersas em máquina auditável.
          </p>
          <p style={{
            fontFamily: 'Montserrat,sans-serif', fontSize: 17, lineHeight: 1.7,
            color: 'rgba(255,255,255,.78)', margin: '16px 0 0', maxWidth: 620
          }}>
            Hoje a Sena acompanha, por ciclo, um máximo de três mentorados — padrão paddock, não sala de aula.
          </p>

          {/* numbers grid */}
          <div style={{
            marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, maxWidth: 860
          }}>
            {numbers.map((it, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: '"JetBrains Mono",monospace', fontWeight: 700,
                  fontSize: it.n.length > 5 ? 24 : 30, letterSpacing: '-.02em',
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
