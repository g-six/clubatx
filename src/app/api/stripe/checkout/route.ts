import { Booking } from '@/lib/models/recordings/types'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
export async function POST(req: NextRequest) {
  const payload = await req.json()
  const {
    data: { object },
  } = payload

  const supabase = await createClient()

  let recorded = await supabase
    .from('bookings')
    .update({
      status: 'PAYING',
    })
    .eq('id', object.client_reference_id)
    .select()
  let booking: Booking | undefined = recorded?.data?.pop()
  if (process.env.STRIPE_DEFAULT_CHECKOUT_SECRET && process.env.STRIPE_SECRET_KEY) {
    // Get the signature sent by Stripe
    const signature = req.headers.get('stripe-signature')
    if (signature) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_DEFAULT_CHECKOUT_SECRET)

        // Handle the event
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)
            recorded = await supabase
              .from('bookings')
              .update({
                status: 'PAID',
              })
              .eq('id', object.client_reference_id)
              .select()
            booking = recorded?.data?.pop()
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);
            break
          case 'payment_method.attached':
            const paymentMethod = event.data.object
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            break
          default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`)
        }
      } catch (err: any) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message)
        return NextResponse.json(err, {
          status: 400,
        })
      }
    }
  }

  return NextResponse.json({
    message: 'Thanks!',
    booking,
  })
}
