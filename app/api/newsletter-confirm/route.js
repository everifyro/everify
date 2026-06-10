import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!token) {
    return NextResponse.redirect(new URL('/?newsletter=invalid', baseUrl))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { data: tokenRecord, error: tokenError } = await supabase
    .from('newsletter_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tokenError || !tokenRecord) {
    return NextResponse.redirect(new URL('/?newsletter=invalid', baseUrl))
  }

  if (tokenRecord.used) {
    return NextResponse.redirect(new URL('/?newsletter=already_used', baseUrl))
  }

  await supabase.from('newsletter_tokens').update({ used: true }).eq('token', token)

  let userId = tokenRecord.user_id

  if (!userId) {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const match = users?.find(u => u.email === tokenRecord.email)
    if (match) userId = match.id
  }

  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ credits: (profile.credits || 0) + 3 })
        .eq('id', userId)
    }
  }

  return NextResponse.redirect(new URL('/?newsletter=confirmed', baseUrl))
}
