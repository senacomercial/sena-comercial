import { CTAButton, Overline } from './Primitives.jsx';

export function ProofStrip({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          fontFamily: 'Montserrat,sans-serif', fontSize: 14,
          color: 'rgba(255,255,255,.72)', lineHeight: 1.6
        }}>
          <span style={{ fontSize: 16, lineHeight: 1.35 }}>📌</span>
          <span><strong style={{ color: '#C5A059' }}>{it.tag}:</strong> {it.body}</span>
        </div>
      ))}
    </div>
  );
}

export function MetricCard({ over, num, sub, variant = 'orange' }) {
  const color = variant === 'gold' ? '#C5A059' : '#E85D04';
  return (
    <div style={{
      background: '#0A0A0A', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 6, padding: 'clamp(16px,3vw,22px) clamp(18px,3vw,24px)', position: 'relative'
    }}>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#C5A059' }}>{over}</div>
      <div className="mcard-num" style={{ fontFamily: '"JetBrains Mono",monospace', fontWeight: 700, color, margin: '8px 0 4px', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em', overflowWrap: 'break-word' }}>{num}</div>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

export function PricingCard({ over, name, price, pricePromo, includes, featured }) {
  return (
    <div style={{
      background: featured ? 'linear-gradient(180deg,#1a1408,#0A0A0A)' : '#0A0A0A',
      border: `1px solid ${featured ? 'rgba(197,160,89,.5)' : 'rgba(255,255,255,.08)'}`,
      borderRadius: 6, padding: '28px 28px 32px', position: 'relative', overflow: 'hidden'
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: 'Montserrat,sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: '#000', background: '#C5A059', padding: '4px 10px', borderRadius: 2 }}>
          DIAGNÓSTICO
        </div>
      )}
      <Overline>{over}</Overline>
      <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: 26, margin: '10px 0 14px', color: '#fff', letterSpacing: '-.01em' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
        {pricePromo && <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 16, color: 'rgba(255,255,255,.35)', textDecoration: 'line-through' }}>{price}</span>}
        <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 30, fontWeight: 700, color: featured ? '#C5A059' : '#fff', letterSpacing: '-.02em' }}>{pricePromo ?? price}</span>
      </div>
      <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
        {pricePromo ? 'fechamento em call' : 'preço cheio'}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {includes.map((item, idx) => (
          <li key={idx} style={{ display: 'flex', gap: 10, fontFamily: 'Montserrat,sans-serif', fontSize: 13, color: '#eee', lineHeight: 1.5 }}>
            <span style={{ color: '#C5A059', fontWeight: 900 }}>✓</span>{item}
          </li>
        ))}
      </ul>
      <CTAButton variant={featured ? 'primary' : 'ghost'} onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
        Conversar com a Sena
      </CTAButton>
    </div>
  );
}
