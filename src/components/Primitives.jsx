import { trackLead } from '../analytics.js';

export function CTAButton({ variant = 'primary', children, onClick, href, icon, size = 'md' }) {
  const bg = variant === 'primary' ? '#C5A059' : variant === 'ignition' ? '#E85D04' : 'transparent';
  const color = variant === 'ghost' ? '#fff' : '#000';
  const border = variant === 'ghost' ? '1px solid rgba(255,255,255,.25)' : 'none';
  const pad = size === 'lg' ? '18px 32px' : size === 'sm' ? '10px 18px' : '15px 28px';
  const fs = size === 'lg' ? 15 : size === 'sm' ? 12 : 14;
  const style = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: fs,
    letterSpacing: '.04em', textDecoration: 'none', cursor: 'pointer',
    border, padding: pad, borderRadius: 3, background: bg, color,
    transition: 'filter .12s, border-color .15s'
  };
  const hover = {
    onMouseEnter: e => e.currentTarget.style.filter = 'brightness(1.12)',
    onMouseLeave: e => e.currentTarget.style.filter = 'none',
  };
  if (href) {
    const handleClick = href.includes('chat.whatsapp.com') ? () => trackLead() : undefined;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={style} onClick={handleClick} {...hover}>
        {icon}{children}
      </a>
    );
  }
  return <button onClick={onClick} style={style} {...hover}>{icon}{children}</button>;
}

export function Overline({ children, variant = 'gold' }) {
  return (
    <span style={{
      fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
      letterSpacing: '.16em', textTransform: 'uppercase',
      color: variant === 'orange' ? '#E85D04' : '#C5A059'
    }}>{children}</span>
  );
}

export function Highlight({ children, color = 'orange' }) {
  return (
    <em style={{
      fontFamily: '"Playfair Display", serif', fontStyle: 'italic',
      fontWeight: 800, color: color === 'gold' ? '#C5A059' : '#E85D04'
    }}>{children}</em>
  );
}

export function SectionHeader({ over, title, lede, align = 'left' }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 720 : undefined, margin: align === 'center' ? '0 auto' : undefined }}>
      {over && <Overline>{over}</Overline>}
      <h2 style={{
        fontFamily: '"Playfair Display", serif', fontWeight: 700,
        fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1, letterSpacing: '-.02em',
        margin: '14px 0 14px', color: '#fff'
      }}>{title}</h2>
      {lede && <p style={{
        fontFamily: 'Montserrat, sans-serif', fontSize: 17, lineHeight: 1.6,
        color: 'rgba(255,255,255,.7)', margin: 0, maxWidth: 640
      }}>{lede}</p>}
    </div>
  );
}
