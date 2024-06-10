import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { NATS_SERVICE } from '../config/services';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.STRIPE_SECRET_KEY);
    private readonly logger = new Logger(PaymentsService.name);

    constructor(@Inject(NATS_SERVICE)private readonly client: ClientProxy) {}

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
        const { currency, items, orderId } = paymentSessionDto;
        const lineItems = items.map((item) => ({
            price_data: {
                currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
            payment_intent_data: {
                metadata: {
                    orderId,
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.STRIPE_SUCCESS_URL,
            cancel_url: envs.STRIPE_CANCEL_URL,
        });

        // return session;
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        }
    }

    async stripeWebhookHandler(request: Request, response: Response) {
        const sig = request.headers['stripe-signature'];
        let event: Stripe.Event;
        
        const endpointSecret = envs.STRIPE_WEBHOOK_SECRET;

        try {
            event = this.stripe.webhooks.constructEvent(request['rawBody'], sig, endpointSecret);
        } catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }        
        
        switch(event.type) {
            case 'charge.succeeded':
                const charge = event.data.object;
                const payload = {
                    stripePaymentId: charge.id,
                    orderId: charge.metadata.orderId,
                    receiptUrl : charge.receipt_url
                };
                
                // Since we don't need to wait for the response here.
                // we can just emit payment succeeded event to orders microservice via NATS
                this.client.emit('payment.succeeded', payload);
                break;
            break;
            default:
                console.log(`Evento ${event.type} no controlado`);                
        }
        return response.status(200).json({ sig });
    }
}
