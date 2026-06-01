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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, description, link, email, is_anonymous, original_message } = body

    if (!type || !description?.trim()) {
      return Response.json({ error: 'Tipul și descrierea sunt obligatorii.' }, { status: 400 })
    }

    const { error: dbError } = await supabase.from('scam_reports').insert({
      type,
      description: description.trim(),
      link: link || null,
      email: email || null,
      is_anonymous: is_anonymous ?? true,
      original_message: original_message || null,
    })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return Response.json({ error: 'Eroare la salvarea raportării.' }, { status: 500 })
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
