import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 580, width: '100%' }}>
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3b82f6',
            marginBottom: '1.2rem',
          }}
        >
          Adolfo Arroyo Solutions
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 'clamp(2.4rem, 8vw, 3.8rem)',
            lineHeight: 1.1,
            color: '#f0f0f0',
            marginBottom: '1.4rem',
            letterSpacing: '-0.02em',
          }}
        >
          Tu negocio,{' '}
          <span style={{ color: '#3b82f6' }}>en piloto automático</span>
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: '#888',
            marginBottom: '2.5rem',
            maxWidth: 460,
            margin: '0 auto 2.5rem',
          }}
        >
          Agentes de IA en WhatsApp que atienden a tus clientes, agendan citas y generan ventas — 24/7, sin que tú tengas que estar.
        </p>

        <Link href="/form" className="btn-primary" style={{ fontSize: '1.05rem' }}>
          Solicitar cotización →
        </Link>

        <p style={{ marginTop: '2rem', fontSize: '0.82rem', color: '#555' }}>
          Más de 30 negocios en México ya automatizaron su atención con nosotros.
        </p>
      </div>
    </main>
  );
}
