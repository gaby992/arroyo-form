'use client';

import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import TextInput from '@/components/ui/TextInput';
import RadioCard from '@/components/ui/RadioCard';
import Chip from '@/components/ui/Chip';
import { formReducer, initialFormData } from '@/lib/types';

const TOTAL_STEPS = 12;

const GIRO_OPTIONS = [
  'Comida / Restaurante',
  'Salud / Clínica / Médico',
  'Belleza / Spa / Estética',
  'Tienda / Ventas',
  'Servicios profesionales',
  'Educación / Cursos',
  'Hotel / Hospedaje',
  'Bienes raíces',
  'Otro',
];

const PROBLEMA_OPTIONS = [
  'Tengo muchos leads y no doy abasto para atenderlos',
  'Los clientes esperan mucho tiempo para recibir respuesta',
  'Necesito atención 24/7 (incluidos fines de semana y festivos)',
  'Necesito agendar citas automáticamente',
  'Quiero automatizar cotizaciones y presupuestos',
  'Quiero reducir costos de personal de atención',
  'Responder preguntas repetitivas básicas',
  'Necesito seguimiento automático de leads',
  'Otro',
];

const PCT_PERDIDAS_OPTIONS = [
  'Menos del 10%',
  'Entre 10% y 30%',
  'Entre 30% y 60%',
  'Más del 60%',
  'No lo sé',
];

const TIPO_PRODUCTO_OPTIONS = [
  'Productos físicos',
  'Servicios profesionales (consultoría, salud, educación, etc.)',
  'Productos digitales (cursos, membresías, software)',
  'Ambos, productos y servicios',
];

const CANALES_OPTIONS = [
  'WhatsApp',
  'Instagram DM',
  'Facebook Messenger',
  'Webchat',
  'Telegram',
  'Correo electrónico',
];

const FUNCIONES_OPTIONS = [
  'Responder preguntas frecuentes',
  'Agendar / cancelar citas',
  'Tomar pedidos',
  'Calificar leads / prospectos',
  'Transferir a un humano',
];

const VOLUMEN_OPTIONS = [
  'Menos de 20',
  '20–100',
  '100–500',
  'Más de 500',
];

const FUENTE_OPTIONS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'Google',
  'YouTube',
  'Me lo recomendaron',
  'Otro',
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidWhatsapp(phone: string) {
  return phone.replace(/[\s+\-()]/g, '').length >= 10;
}

const AUTO_ADVANCE_STEPS = [2, 5, 6, 7, 10, 12];

export default function FormPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, initialFormData);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerError = useCallback(() => {
    setError(true);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    errorTimeout.current = setTimeout(() => setError(false), 500);
  }, []);

  const advance = useCallback(() => {
    setStep((s) => s + 1);
    setStepKey((k) => k + 1);
    setError(false);
  }, []);

  const validate = useCallback((): boolean => {
    switch (step) {
      case 1: return state.nombre_negocio.trim().length > 0;
      case 2: return state.giro.length > 0;
      case 3: return state.ciudad.trim().length > 0;
      case 4: return state.descripcion.trim().length >= 20;
      case 5: return state.problema.length > 0;
      case 6: return state.pct_perdidas.length > 0;
      case 7: return state.tipo_producto.length > 0;
      case 8: return state.canales.length > 0;
      case 9: return state.funciones.length > 0;
      case 10: return true;
      case 11: return (
        state.nombre_contacto.trim().length > 0 &&
        isValidWhatsapp(state.whatsapp) &&
        isValidEmail(state.email)
      );
      case 12: return state.fuente.length > 0;
      default: return true;
    }
  }, [step, state]);

  const handleNext = useCallback(() => {
    if (!validate()) {
      triggerError();
      return;
    }
    if (step < TOTAL_STEPS) {
      advance();
    }
  }, [step, validate, triggerError, advance]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      triggerError();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (res.ok) {
        sessionStorage.setItem('form_completed', '1');
        router.push('/gracias');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar. Intenta de nuevo.');
        setSubmitting(false);
      }
    } catch {
      alert('Error de conexión. Intenta de nuevo.');
      setSubmitting(false);
    }
  }, [state, validate, triggerError, router]);

  // Step 12 auto-submits after fuente selection
  useEffect(() => {
    if (step === 12 && state.fuente && !submitting) {
      handleSubmit();
    }
  }, [state.fuente]); // eslint-disable-line react-hooks/exhaustive-deps

  const descLen = state.descripcion.length;

  return (
    <>
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '4rem 1.5rem 3rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: 600,
            width: '100%',
            margin: '0 auto 3rem',
          }}
        >
          <img
            src="/logo.png"
            alt="Adolfo Arroyo Solutions"
            style={{ height: 120, display: 'block', mixBlendMode: 'screen' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#555' }}>
            {step} de {TOTAL_STEPS}
          </span>
        </div>

        {/* Step content */}
        <div
          key={stepKey}
          className="step-enter"
          style={{
            maxWidth: 600,
            width: '100%',
            margin: '0 auto',
            flex: 1,
          }}
        >
          {/* Step 1 — nombre_negocio */}
          {step === 1 && (
            <StepWrapper
              question="¿Cómo se llama tu negocio?"
              hint="Escríbelo tal como aparece o como te gusta llamarlo."
            >
              <TextInput
                value={state.nombre_negocio}
                onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'nombre_negocio', value: v })}
                onEnter={handleNext}
                placeholder="Ej. Clínica Bienestar Cancún"
                error={error}
                autoFocus
              />
            </StepWrapper>
          )}

          {/* Step 2 — giro */}
          {step === 2 && (
            <StepWrapper question="¿A qué se dedica tu negocio?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {GIRO_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.giro === opt}
                    onSelect={() => {
                      dispatch({ type: 'SET_FIELD', field: 'giro', value: opt });
                      setTimeout(advance, 120);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 3 — ciudad */}
          {step === 3 && (
            <StepWrapper
              question="¿En qué ciudad opera tu negocio?"
              hint="Incluye el estado si lo deseas."
            >
              <TextInput
                value={state.ciudad}
                onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'ciudad', value: v })}
                onEnter={handleNext}
                placeholder="Ej. Cancún, México"
                error={error}
                autoFocus
              />
            </StepWrapper>
          )}

          {/* Step 4 — descripcion */}
          {step === 4 && (
            <StepWrapper
              question="Descríbenos tu negocio"
              hint="¿Qué ofreces? ¿A quién va dirigido? ¿Qué te hace diferente?"
            >
              <div style={{ position: 'relative' }}>
                <TextInput
                  value={state.descripcion}
                  onChange={(v) => {
                    if (v.length <= 300) dispatch({ type: 'SET_FIELD', field: 'descripcion', value: v });
                  }}
                  multiline
                  placeholder="Ej. Somos una clínica dental con 3 consultorios, atendemos pacientes de todas las edades..."
                  error={error}
                  autoFocus
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 14,
                    fontSize: '0.78rem',
                    color: descLen > 250 ? '#f59e0b' : '#555',
                    transition: 'color 0.2s',
                  }}
                >
                  {descLen}/300
                </span>
              </div>
              {descLen < 20 && descLen > 0 && (
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                  Mínimo 20 caracteres ({20 - descLen} restantes)
                </p>
              )}
            </StepWrapper>
          )}

          {/* Step 5 — problema */}
          {step === 5 && (
            <StepWrapper question="¿Qué problema específico quieres resolver?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {PROBLEMA_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.problema === opt}
                    onSelect={() => {
                      dispatch({ type: 'SET_FIELD', field: 'problema', value: opt });
                      setTimeout(advance, 120);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 6 — pct_perdidas */}
          {step === 6 && (
            <StepWrapper question="¿Qué porcentaje de esas conversaciones se pierden o quedan sin respuesta?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {PCT_PERDIDAS_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.pct_perdidas === opt}
                    onSelect={() => {
                      dispatch({ type: 'SET_FIELD', field: 'pct_perdidas', value: opt });
                      setTimeout(advance, 120);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 7 — tipo_producto */}
          {step === 7 && (
            <StepWrapper question="¿Qué vendes o promocionas?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {TIPO_PRODUCTO_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.tipo_producto === opt}
                    onSelect={() => {
                      dispatch({ type: 'SET_FIELD', field: 'tipo_producto', value: opt });
                      setTimeout(advance, 120);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 8 — canales */}
          {step === 8 && (
            <StepWrapper
              question="¿Por qué canales te contactan tus clientes?"
              hint="Selecciona todos los que apliquen."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {CANALES_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={state.canales.includes(opt)}
                    onToggle={() => dispatch({ type: 'TOGGLE_ARRAY', field: 'canales', value: opt })}
                  />
                ))}
              </div>
              {error && state.canales.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.75rem' }}>
                  Selecciona al menos un canal.
                </p>
              )}
            </StepWrapper>
          )}

          {/* Step 9 — funciones */}
          {step === 9 && (
            <StepWrapper
              question="¿Qué quieres que haga tu agente?"
              hint="Elige hasta 3 funciones."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {FUNCIONES_OPTIONS.map((opt) => {
                  const selected = state.funciones.includes(opt);
                  const maxed = state.funciones.length >= 3;
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={selected}
                      onToggle={() => dispatch({ type: 'TOGGLE_ARRAY', field: 'funciones', value: opt })}
                      disabled={!selected && maxed}
                    />
                  );
                })}
              </div>
              {state.funciones.length === 3 && (
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem' }}>
                  Máximo 3 funciones seleccionadas.
                </p>
              )}
            </StepWrapper>
          )}

          {/* Step 10 — volumen_mensajes (optional) */}
          {step === 10 && (
            <StepWrapper
              question="¿Cuántos mensajes recibes al mes, aproximadamente?"
              hint="Opcional — nos ayuda a dimensionar tu agente."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {VOLUMEN_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.volumen_mensajes === opt}
                    onSelect={() => {
                      dispatch({ type: 'SET_FIELD', field: 'volumen_mensajes', value: opt });
                      setTimeout(advance, 120);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step 11 — combined contact fields */}
          {step === 11 && (
            <StepWrapper question="¿Cómo te contactamos?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Nombre completo
                  </label>
                  <TextInput
                    value={state.nombre_contacto}
                    onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'nombre_contacto', value: v })}
                    placeholder="Tu nombre completo"
                    error={error && !state.nombre_contacto.trim()}
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '0.4rem',
                    }}
                  >
                    WhatsApp
                  </label>
                  <TextInput
                    value={state.whatsapp}
                    onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'whatsapp', value: v })}
                    placeholder="+52 998 123 4567"
                    type="tel"
                    error={error && !isValidWhatsapp(state.whatsapp)}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: '#666',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Correo electrónico
                  </label>
                  <TextInput
                    value={state.email}
                    onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'email', value: v })}
                    onEnter={handleNext}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    error={error && !isValidEmail(state.email)}
                  />
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Step 12 — fuente */}
          {step === 12 && (
            <StepWrapper question="¿Cómo nos encontraste?">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {FUENTE_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt}
                    label={opt}
                    selected={state.fuente === opt}
                    onSelect={() => {
                      if (submitting) return;
                      dispatch({ type: 'SET_FIELD', field: 'fuente', value: opt });
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* CTA button — hidden on auto-advance steps */}
          {!AUTO_ADVANCE_STEPS.includes(step) && (
            <div style={{ marginTop: '2rem' }}>
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={submitting}
                style={{ minWidth: 180 }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Enviando...
                  </>
                ) : (
                  'Continuar →'
                )}
              </button>
            </div>
          )}

          {/* Skip for step 10 (volumen optional, auto-advance) */}
          {step === 10 && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={advance}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#555',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Omitir esta pregunta →
              </button>
            </div>
          )}

          {/* Submitting overlay for step 12 */}
          {step === 12 && submitting && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
              <span className="spinner" />
              <span style={{ fontSize: '0.9rem' }}>Enviando tu solicitud...</span>
            </div>
          )}
        </div>

        {/* Back button */}
        {step > 1 && (
          <div
            style={{
              maxWidth: 600,
              width: '100%',
              margin: '2rem auto 0',
            }}
          >
            <button
              onClick={() => {
                setStep((s) => s - 1);
                setStepKey((k) => k + 1);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#444',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ← Atrás
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function StepWrapper({
  question,
  hint,
  children,
}: {
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
          color: '#f0f0f0',
          lineHeight: 1.2,
          marginBottom: hint ? '0.5rem' : '1.5rem',
          letterSpacing: '-0.01em',
        }}
      >
        {question}
      </h2>
      {hint && (
        <p
          style={{
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
