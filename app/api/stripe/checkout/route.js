import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PLANS = {
  starter: { priceId: 'price_1TVWF5PHeKMimTR5zpaSwrYd', credits: 10 },
  basic: { priceId: 'price_1TVWGDPHeKMimTR5xFX33SSa', credits: 25 },
  pro: { priceId: 'price_1TVWHEPHeKMimTR5BYrGSQ1i', credits: 60 },
  expert: { priceId: 'price_1TVWIUPHeKMimTR5uDkxpnil', credits: 200 },
}

export async function POST(request) {
  try {
    const { plan, userId, userEmail } = await request.json()

    if (!plan || !userId) {
      return Response.json({ error: 'Date lipsă' }, { status: 400 })
    }

    const planData = PLANS[plan.toLowerCase()]
    if (!planData) {
      return Response.json({ error: 'Plan invalid' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: planData.priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/prices?cancelled=true`,
      customer_email: userEmail,
      metadata: { userId, plan, credits: planData.credits.toString() },
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' }
      },
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}