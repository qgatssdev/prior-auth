import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, randomBytes, randomUUID } from 'crypto';
import { Config } from 'src/config';
import { PayerRepository } from 'src/modules/payers/repository/payer.repository';
import { SimulateDto } from '../dto/simulate.dto';

@Injectable()
export class SimulatorService {
  // Last normal event sent per payer slug, kept in memory: enough for a demo.
  private readonly lastSent = new Map<
    string,
    { eventId: string; body: string }
  >();

  constructor(private readonly payerRepository: PayerRepository) {}

  async send(
    slug: string,
    { payerReference, status, note, mode }: SimulateDto,
  ) {
    const payer = await this.payerRepository.findBySlugWithSecret(slug);
    if (!payer) {
      throw new NotFoundException('Payer not found');
    }

    let eventId: string;
    let body: string;
    if (mode === 'duplicate') {
      // A real retry: the exact same bytes as before.
      const last = this.lastSent.get(slug);
      if (!last) {
        throw new BadRequestException(
          'Send a normal event to this payer first',
        );
      }
      ({ eventId, body } = last);
    } else {
      eventId = `evt_${randomUUID()}`;
      body = JSON.stringify({ eventId, payerReference, status, note });
    }

    const secret =
      mode === 'bad_signature'
        ? randomBytes(32).toString('hex')
        : payer.webhookSecret;
    const signature = createHmac('sha256', secret).update(body).digest('hex');

    const response = await fetch(
      `${Config.API_BASE_URL}/api/v1/webhooks/payers/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Id': eventId,
          'X-Signature': signature,
        },
        body,
      },
    );

    if (mode === 'normal') {
      this.lastSent.set(slug, { eventId, body });
    }
    return {
      httpStatus: response.status,
      body: (await response.json()) as unknown,
    };
  }
}
