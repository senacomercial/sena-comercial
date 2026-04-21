export default function FilterBlock({ title = 'O Protocolo MaVIS', steps }) {
  return (
    <div style={{
      borderLeft: '3px solid #E85D04',
      padding: '22px 26px',
      background: 'rgba(232,93,4,.06)',
      textAlign: 'left'
    }}>
      <div style={{
        fontFamily: 'Montserrat,sans-serif', fontSize: 11, fontWeight: 700,
        letterSpacing: '.16em', textTransform: 'uppercase', color: '#E85D04',
        marginBottom: 16
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontFamily: 'Montserrat,sans-serif', fontSize: 14, color: '#f0f0f0', lineHeight: 1.5 }}>
            <div style={{ flexShrink: 0, background: '#E85D04', color: '#000', fontWeight: 900, fontSize: 12, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</div>
            <div><strong style={{ color: '#fff' }}>{s.title}</strong>{' — '}{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
