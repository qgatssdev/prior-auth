import { Module } from '@nestjs/common';
import { PayersModule } from '../payers/payers.module';
import { PriorAuthsModule } from '../prior-auths/prior-auths.module';
import { WebhooksController } from './controllers/webhooks.controller';
import { PayerWebhookEventRepository } from './repository/payer-webhook-event.repository';
import { WebhooksService } from './services/webhooks.service';

@Module({
  imports: [PayersModule, PriorAuthsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PayerWebhookEventRepository],
})
export class WebhooksModule {}
