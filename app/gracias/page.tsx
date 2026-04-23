'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GraciasPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const completed = sessionStorage.getItem('form_completed');
    if (!completed) {
      router.replace('/form');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const steps = [
    { num: '01', text: 'Revisamos tu solicitud' },
    { num: '02', text: 'Sesión de 15 min para afinar detalles' },
    { num: '03', text: 'Lanzamos tu agente en 48–72 hrs' },
  ];

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
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Animated checkmark */}
        <div
          className="checkmark-animate"
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)',
            border: '2px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '1.8rem',
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
            color: '#f0f0f0',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          ¡Información recibida!
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#888',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: 440,
            margin: '0 auto 2.5rem',
          }}
        >
          El siguiente paso es una sesión de 15 min para personalizar tu agente al 100%.
        </p>

        <a
          href="https://calendly.com/adolfoarroyoai/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ fontSize: '1rem' }}
        >
          Agendar sesión gratis →
        </a>

        {/* Next steps cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginTop: '3rem',
          }}
        >
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                background: '#141414',
                border: '1.5px solid #242424',
                borderRadius: 14,
                padding: '1.25rem 1rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#3b82f6',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.06em',
                }}
              >
                {s.num}
              </p>
              <p style={{ fontSize: '0.88rem', color: '#c0c0c0', lineHeight: 1.4 }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
