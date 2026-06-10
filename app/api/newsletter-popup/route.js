import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Supabase table required:
// CREATE TABLE newsletter_tokens (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   email TEXT NOT NULL,
//   token TEXT NOT NULL UNIQUE,
//   user_id UUID,
//   used BOOLEAN DEFAULT false,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

export async function POST(request) {
  try {
    const { email, userId } = await request.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Email invalid' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const token = randomUUID()
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter-confirm?token=${token}`

    const { error: dbError } = await supabase.from('newsletter_tokens').insert({
      email,
      token,
      user_id: userId || null,
      used: false
    })

    if (dbError) {
      console.error('newsletter_tokens insert error:', dbError)
      return Response.json({ error: 'Eroare server' }, { status: 500 })
    }

    const groups = process.env.MAILERLITE_NEWSLETTER_POPUP_GROUP_ID
      ? [process.env.MAILERLITE_NEWSLETTER_POPUP_GROUP_ID]
      : []

    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email,
        fields: {
          source: 'newsletter_popup',
          confirm_url: confirmUrl
        },
        groups
      })
    })

    const mlData = await mlRes.json()
    if (!mlRes.ok && mlRes.status !== 409 && !mlData.message?.includes('already')) {
      console.error('MailerLite error:', mlData)
    }

    return Response.json({
      success: true,
      message: 'Verifică emailul pentru a confirma abonarea și a primi 3 credite bonus!'
    })

  } catch (error) {
    console.error('newsletter-popup error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}
