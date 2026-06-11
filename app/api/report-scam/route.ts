import { createClient } from '@supabase/supabase-js'

/*
  SQL pentru tabelul scam_reports (rulați în Supabase SQL Editor):

  CREATE TABLE scam_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    email TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    original_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
  );

  ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Service role full access" ON scam_reports USING (true) WITH CHECK (true);
*/

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase()
}

function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''
  if (hasPlus) return '+' + digits
  if (digits.startsWith('40') && digits.length >= 11) return '+' + digits
  if (digits.startsWith('0')) return '+4' + digits
  return digits
}

function normalizeWebsite(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}

function normalizeFacebook(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^m\./i, '')
    .replace(/\/$/, '')
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, description, link, email, is_anonymous, original_message, iban, telefon, website, facebook, email_suspect } = body

    if (!type || !description?.trim()) {
      return Response.json({ error: 'Tipul și descrierea sunt obligatorii.' }, { status: 400 })
    }

    const { data: insertedRow, error: dbError } = await supabase
      .from('scam_reports')
      .insert({
        type,
        description: description.trim(),
        link: link || null,
        email: email || null,
        is_anonymous: is_anonymous ?? true,
        original_message: original_message || null,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return Response.json({ error: 'Eroare la salvarea raportării.' }, { status: 500 })
    }

    // Inserează entitățile structurate în report_entities
    const reportId = insertedRow.id
    const entities: { report_id: string; entity_type: string; entity_value: string }[] = []

    if (iban?.trim()) {
      const val = normalizeIban(iban)
      if (val) entities.push({ report_id: reportId, entity_type: 'iban', entity_value: val })
    }
    if (telefon?.trim()) {
      const val = normalizePhone(telefon)
      if (val) entities.push({ report_id: reportId, entity_type: 'telefon', entity_value: val })
    }
    if (website?.trim()) {
      const val = normalizeWebsite(website)
      if (val) entities.push({ report_id: reportId, entity_type: 'website', entity_value: val })
    }
    if (facebook?.trim()) {
      const val = normalizeFacebook(facebook)
      if (val) entities.push({ report_id: reportId, entity_type: 'facebook', entity_value: val })
    }
    if (email_suspect?.trim()) {
      const val = normalizeEmail(email_suspect)
      if (val) entities.push({ report_id: reportId, entity_type: 'email', entity_value: val })
    }

    if (entities.length > 0) {
      const { error: entErr } = await supabase.from('report_entities').insert(entities)
      if (entErr) {
        console.error('report_entities insert error:', entErr)
        // Nu blocăm răspunsul — raportarea principală a fost salvată
      }
    }

    // Trimite confirmare prin MailerLite dacă userul a lăsat email
    if (email && !is_anonymous) {
      try {
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            fields: { source: 'scam-report' },
            groups: process.env.MAILERLITE_REPORT_GROUP_ID
              ? [process.env.MAILERLITE_REPORT_GROUP_ID]
              : [],
          }),
        })
      } catch (mlError) {
        console.error('MailerLite error:', mlError)
        // Nu blocăm răspunsul dacă MailerLite eșuează
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Report scam error:', err)
    return Response.json({ error: 'Eroare server.' }, { status: 500 })
  }
}
