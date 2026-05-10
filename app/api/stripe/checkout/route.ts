import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PACKAGES: Record<string, { credits: number; name: string }> = {
  'price_1TVWF5PHeKMimTR5zpaSwrYd': { credits: 10, name: 'Starter' },
  'price_1TVWGDPHeKMimTR5xFX33SSa': { credits: 25, name: 'Basic' },
  'price_1TVWHEPHeKMimTR5BYrGSQ1i': { credits: 60, name: 'Pro' },
  'price_1TVWIUPHeKMimTR5uDkxpnil': { credits: 200, name: 'Expert' },
};

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!PACKAGES[priceId]) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        userId,
        priceId,
        credits: PACKAGES[priceId].credits.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
