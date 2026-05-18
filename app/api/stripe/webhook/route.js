import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook signature error:', error)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, credits } = session.metadata

    if (userId && credits) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      const currentCredits = profile?.credits || 0
      const newCredits = currentCredits + parseInt(credits)

      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId)

      console.log(`Credits updated for user ${userId}: ${currentCredits} + ${credits} = ${newCredits}`)
    }
  }

  return Response.json({ received: true })
}