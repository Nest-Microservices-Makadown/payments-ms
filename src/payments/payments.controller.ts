import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  @MessagePattern('create.payment.session')
  async createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return await this.paymentsService.createPaymentSession(paymentSessionDto);
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
  async stripeWebhook(@Req() req: Request,@Res() res: Response) {
    return this.paymentsService.stripeWebhookHandler(req, res);
  }

}
