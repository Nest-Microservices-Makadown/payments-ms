import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession() {
    return 'createPaymentSession';
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'success baby!',
    };
  }

  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'cancel baby!',
    };
  }

  @Post('webhook')
  async stripeWebhook() {
    return 'Stripe webhook';
  }

}
