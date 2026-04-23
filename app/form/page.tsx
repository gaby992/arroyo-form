'use client';

import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import TextInput from '@/components/ui/TextInput';
import RadioCard from '@/components/ui/RadioCard';
import Chip from '@/components/ui/Chip';
import { formReducer, initialFormData } from '@/lib/types';

const TOTAL_STEPS = 11;

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
      case 5: return state.canales.length > 0;
      case 6: return state.funciones.length > 0;
      case 7: return true; // optional
      case 8: return state.nombre_contacto.trim().length > 0;
      case 9: return isValidWhatsapp(state.whatsapp);
      case 10: return isValidEmail(state.email);
      case 11: return state.fuente.length > 0;
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

  // Step 11 auto-advance after selection
  useEffect(() => {
    if (step === 11 && state.fuente && !submitting) {
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
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            maxWidth: 600,
            width: '100%',
            margin: '0 auto 3rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#3b82f6',
            }}
          >
            Adolfo Arroyo Solutions
          </span>
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
          {/* Step 1 */}
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

          {/* Step 2 */}
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

          {/* Step 3 */}
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

          {/* Step 4 */}
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

          {/* Step 5 */}
          {step === 5 && (
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

          {/* Step 6 */}
          {step === 6 && (
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

          {/* Step 7 */}
          {step === 7 && (
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

          {/* Step 8 */}
          {step === 8 && (
            <StepWrapper question="¿Cuál es tu nombre?">
              <TextInput
                value={state.nombre_contacto}
                onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'nombre_contacto', value: v })}
                onEnter={handleNext}
                placeholder="Tu nombre completo"
                error={error}
                autoFocus
              />
            </StepWrapper>
          )}

          {/* Step 9 */}
          {step === 9 && (
            <StepWrapper
              question={`Hola${state.nombre_contacto ? ' ' + state.nombre_contacto.split(' ')[0] : ''}! ¿Cuál es tu WhatsApp?`}
              hint="Te contactaremos por aquí para agendar tu sesión gratuita."
            >
              <TextInput
                value={state.whatsapp}
                onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'whatsapp', value: v })}
                onEnter={handleNext}
                placeholder="+52 998 123 4567"
                type="tel"
                error={error}
                autoFocus
              />
            </StepWrapper>
          )}

          {/* Step 10 */}
          {step === 10 && (
            <StepWrapper
              question="¿Cuál es tu correo electrónico?"
              hint="Te enviaremos un resumen de tu solicitud."
            >
              <TextInput
                value={state.email}
                onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'email', value: v })}
                onEnter={handleNext}
                placeholder="correo@ejemplo.com"
                type="email"
                error={error}
                autoFocus
              />
            </StepWrapper>
          )}

          {/* Step 11 */}
          {step === 11 && (
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

          {/* CTA button (not shown on auto-advance steps) */}
          {![2, 7, 11].includes(step) && (
            <div style={{ marginTop: '2rem' }}>
              <button
                className="btn-primary"
                onClick={step === 11 ? handleSubmit : handleNext}
                disabled={submitting}
                style={{ minWidth: 180 }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Enviando...
                  </>
                ) : step === TOTAL_STEPS ? (
                  'Enviar solicitud →'
                ) : (
                  'Continuar →'
                )}
              </button>
              {step === 7 && (
                <button
                  onClick={advance}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                  }}
                >
                  Omitir
                </button>
              )}
            </div>
          )}

          {/* Skip for step 7 (auto-advance) */}
          {step === 7 && (
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

          {/* Submitting overlay for step 11 */}
          {step === 11 && submitting && (
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
