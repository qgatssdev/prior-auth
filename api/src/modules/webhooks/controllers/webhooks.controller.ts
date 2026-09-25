import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { WebhooksService } from '../services/webhooks.service';

@ApiTags('webhooks')
@Controller({ path: 'webhooks', version: '1' })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // No @Body() DTO on purpose: the body is validated only after the signature check.
  @Post('payers/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({ name: 'X-Event-Id', required: true })
  @ApiHeader({
    name: 'X-Signature',
    required: true,
    description: 'Hex HMAC-SHA256 of the raw body',
  })
  async receive(
    @Param('slug') slug: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-event-id') eventIdHeader?: string,
    @Headers('x-signature') signatureHeader?: string,
  ) {
    const result = await this.webhooksService.handlePayerEvent({
      slug,
      rawBody: req.rawBody ?? Buffer.alloc(0),
      body: req.body as unknown,
      eventIdHeader,
      signatureHeader,
    });
    return BaseResponse.successResponse({ result }, result);
  }
}
