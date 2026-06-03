import {
  Controller,
  Post,
  Req,
  Headers,
  UseGuards,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent/:orderId')
  @UseGuards(JwtAuthGuard)
  createPaymentIntent(@Param('orderId') orderId: string, @Req() req: any) {
    return this.paymentsService.createPaymentIntent(orderId, req.user.id);
  }

  @Post('verify/:paymentIntentId')
  @Public()
  verifyPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.verifyPayment(paymentIntentId);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) {
      throw new Error('Raw body is missing');
    }
    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }
}
