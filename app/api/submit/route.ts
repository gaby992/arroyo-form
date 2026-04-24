import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { LeadFormData } from '@/lib/types';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidWhatsapp(phone: string) {
  return phone.replace(/[\s+\-()]/g, '').length >= 10;
}

export async function POST(req: NextRequest) {
  let body: Partial<LeadFormData>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const required: (keyof LeadFormData)[] = [
    'nombre_negocio', 'giro', 'ciudad', 'descripcion',
    'problema', 'pct_perdidas', 'tipo_producto',
    'canales', 'funciones', 'nombre_contacto', 'whatsapp', 'email', 'fuente',
  ];

  for (const field of required) {
    const val = body[field];
    if (!val || (Array.isArray(val) && val.length === 0)) {
      return NextResponse.json({ error: `Campo requerido: ${field}` }, { status: 400 });
    }
  }

  if (!isValidEmail(body.email!)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  if (!isValidWhatsapp(body.whatsapp!)) {
    return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
  }

  if ((body.descripcion?.length ?? 0) < 20) {
    return NextResponse.json({ error: 'Descripción muy corta' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error: dbError } = await supabase.from('leads').insert({
    nombre_negocio: body.nombre_negocio,
    giro: body.giro,
    ciudad: body.ciudad,
    descripcion: body.descripcion,
    problema: body.problema,
    pct_perdidas: body.pct_perdidas,
    tipo_producto: body.tipo_producto,
    canales: body.canales,
    funciones: body.funciones,
    volumen_mensajes: body.volumen_mensajes || null,
    nombre_contacto: body.nombre_contacto,
    whatsapp: body.whatsapp,
    email: body.email,
    fuente: body.fuente,
    status: 'nuevo',
  });

  if (dbError) {
    console.error('Supabase insert error:', dbError);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }

  let sheets_synced = false;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const sheetPayload = {
        ...body,
        canales: (body.canales as string[]).join(', '),
        funciones: (body.funciones as string[]).join(', '),
        created_at: new Date().toISOString(),
      };
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload),
      });
      sheets_synced = res.ok;
    } catch (err) {
      console.error('Google Sheets webhook error:', err);
    }
  }

  return NextResponse.json({ success: true, sheets_synced });
}
