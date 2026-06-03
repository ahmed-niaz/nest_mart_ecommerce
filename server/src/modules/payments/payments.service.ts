import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from '../../../generated/prisma/index.js';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2024-04-10' as any, // fallback for versioning issues
      },
    );
  }

  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const amountInPaisa = Math.round(Number(order.total) * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInPaisa,
      currency: 'bdt',
      metadata: {
        orderId: order.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret || '',
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new Error('Webhook Error');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.handleSuccessfulPayment(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        await this.handleFailedPayment(failedIntent);
        break;
      }
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: OrderStatus.PROCESSING,
        },
      });

      await this.prisma.paymentLog.create({
        data: {
          orderId,
          provider: 'stripe',
          txId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          status: 'succeeded',
        },
      });
    }
  }

  private async handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      await this.prisma.paymentLog.create({
        data: {
          orderId,
          provider: 'stripe',
          txId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          status: 'failed',
        },
      });
    }
  }

  /**
   * Verify a payment intent directly with Stripe (fallback for when webhooks aren't available).
   * Called by the frontend after Stripe redirects back with a payment_intent ID.
   */
  async verifyPayment(paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      throw new Error('No order associated with this payment');
    }

    // Verify the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error('Order not found');
    }

    // Only update if not already marked as completed (idempotent)
    if (order.paymentStatus !== PaymentStatus.COMPLETED) {
      if (paymentIntent.status === 'succeeded') {
        await this.handleSuccessfulPayment(paymentIntent);
        this.logger.log(
          `Payment verified for order ${orderId} — marked as PAID`,
        );
      } else if (
        paymentIntent.status === 'canceled' ||
        paymentIntent.status === 'requires_payment_method'
      ) {
        await this.handleFailedPayment(paymentIntent);
        this.logger.warn(
          `Payment verification: intent ${paymentIntentId} status is ${paymentIntent.status}`,
        );
      }
    }

    return {
      orderId,
      paymentStatus:
        paymentIntent.status === 'succeeded'
          ? 'COMPLETED'
          : paymentIntent.status,
      stripeStatus: paymentIntent.status,
    };
  }
}
