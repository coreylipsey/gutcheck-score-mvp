import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Container } from '@/infrastructure/di/container';
import { TokenService } from '@/application/services/TokenService';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing completed checkout session:', session.id);

  // Extract metadata
  const metadata = session.metadata;
  if (!metadata || metadata.type !== 'token_purchase') {
    console.log('Not a token purchase session');
    return;
  }

  const userId = metadata.userId;
  const tokens = parseInt(metadata.tokens || '0');
  const packageId = metadata.packageId;

  if (!userId || !tokens || !packageId) {
    console.error('Missing required metadata for token purchase');
    return;
  }

  try {
    // Get token service from DI container
    const tokenService = Container.getInstance().resolve<TokenService>('TokenService');
    
    // Update purchase status to completed
    const purchase = await tokenService.getPurchaseByStripeIntent(session.payment_intent as string);
    if (purchase) {
      await tokenService.updatePurchaseStatus(purchase.id, 'completed');
    }

    // Add tokens to user balance
    await tokenService.addTokensToUser(
      userId,
      tokens,
      'stripe',
      session.payment_intent as string
    );

    console.log(`Successfully credited ${tokens} tokens to user ${userId}`);
  } catch (error) {
    console.error('Error processing token purchase:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  
  // This is handled by checkout.session.completed for token purchases
  // but we can add additional logic here if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);
  
  try {
    // Get token service from DI container
    const tokenService = Container.getInstance().resolve<TokenService>('TokenService');
    
    // Update purchase status to failed
    const purchase = await tokenService.getPurchaseByStripeIntent(paymentIntent.id);
    if (purchase) {
      await tokenService.updatePurchaseStatus(purchase.id, 'failed');
    }
  } catch (error) {
    console.error('Error updating failed payment:', error);
  }
} 