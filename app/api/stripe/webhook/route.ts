import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PACKAGES: Record<string, { credits: number; name: string }> = {
  'price_1TVWF5PHeKMimTR5zpaSwrYd': { credits: 10, name: 'Starter' },
  'price_1TVWGDPHeKMimTR5xFX33SSa': { credits: 25, name: 'Basic' },
  'price_1TVWHEPHeKMimTR5BYrGSQ1i': { credits: 60, name: 'Pro' },
  'price_1TVWIUPHeKMimTR5uDkxpnil': { credits: 200, name: 'Expert' },
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature error:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, priceId, credits } = session.metadata!;

    const creditsToAdd = parseInt(credits);

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    const currentCredits = profile?.credits || 0;

    await supabase
      .from('profiles')
      .update({ credits: currentCredits + creditsToAdd })
      .eq('id', userId);

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);
  }

  return NextResponse.json({ received: true });
}
