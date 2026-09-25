import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  ActorType,
  PriorAuthStatus,
  WebhookResult,
} from 'src/libs/common/constants';
import { PayerRepository } from 'src/modules/payers/repository/payer.repository';
import { PriorAuthRequestRepository } from 'src/modules/prior-auths/repository/prior-auth-request.repository';
import { PriorAuthsService } from 'src/modules/prior-auths/services/prior-auths.service';
import { QueryFailedError } from 'typeorm';
import { PayerStatusWord, PayerWebhookDto } from '../dto/payer-webhook.dto';
import { PayerWebhookEvent } from '../entity/payer-webhook-event.entity';
import { PayerWebhookEventRepository } from '../repository/payer-webhook-event.repository';

const STATUS_MAP: Record<PayerStatusWord, PriorAuthStatus> = {
  pending: PriorAuthStatus.PENDING_PAYER,
  needs_info: PriorAuthStatus.NEEDS_INFO,
  approved: PriorAuthStatus.APPROVED,
  denied: PriorAuthStatus.DENIED,
};

export interface WebhookInput {
  slug: string;
  rawBody: Buffer;
  body: unknown;
  eventIdHeader?: string;
  signatureHeader?: string;
}

// Hex HMAC-SHA256 of the exact bytes received, compared in constant time.
export const isValidSignature = (
  secret: string,
  rawBody: Buffer,
  signature?: string,
) => {
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const provided = Buffer.from(signature ?? '', 'hex');
  // timingSafeEqual throws on different lengths, so check that first.
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
};

@Injectable()
export class WebhooksService {
  constructor(
    private readonly payerRepository: PayerRepository,
    private readonly inboxRepository: PayerWebhookEventRepository,
    private readonly priorAuthRequestRepository: PriorAuthRequestRepository,
    private readonly priorAuthsService: PriorAuthsService,
  ) {}

  async handlePayerEvent(input: WebhookInput): Promise<WebhookResult> {
    const payer = await this.payerRepository.findBySlugWithSecret(input.slug);
    if (!payer) {
      throw new NotFoundException('Payer not found');
    }

    if (
      !isValidSignature(
        payer.webhookSecret,
        input.rawBody,
        input.signatureHeader,
      )
    ) {
      // Recorded for auditing; the partial unique index ignores unsigned rows.
      await this.inboxRepository.save({
        payerId: payer.id,
        externalEventId: input.eventIdHeader ?? 'unknown',
        payload: input.body ?? {},
        signatureValid: false,
        result: WebhookResult.INVALID_SIGNATURE,
        processedAt: new Date(),
      });
      throw new UnauthorizedException('Invalid signature');
    }

    // Validate only after the signature: until then the body is untrusted.
    const event = await this.parseBody(input.body);
    // The idempotency key comes from the signed body. The header is not signed,
    // so a replayed request with a new X-Event-Id must not look like a new event.
    if (input.eventIdHeader !== event.eventId) {
      throw new BadRequestException('X-Event-Id must match the body eventId');
    }

    let inboxRow: PayerWebhookEvent;
    try {
      inboxRow = await this.inboxRepository.save({
        payerId: payer.id,
        externalEventId: event.eventId,
        payload: input.body,
        signatureValid: true,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return WebhookResult.DUPLICATE_IGNORED;
      }
      throw error;
    }

    try {
      const result = await this.apply(event, payer.id, payer.name);
      await this.inboxRepository.save({
        ...inboxRow,
        result,
        processedAt: new Date(),
      });
      return result;
    } catch (error) {
      // Unexpected failure: remove the row so the insurer's retry is processed, not ignored.
      await this.inboxRepository.delete(inboxRow.id);
      throw error;
    }
  }

  private async apply(
    event: PayerWebhookDto,
    payerId: string,
    payerName: string,
  ): Promise<WebhookResult> {
    const request = await this.priorAuthRequestRepository.findOne({
      where: { payerId, payerReference: event.payerReference },
    });
    if (!request) {
      return WebhookResult.CASE_NOT_FOUND;
    }

    try {
      await this.priorAuthsService.transition(
        request.id,
        STATUS_MAP[event.status],
        { type: ActorType.PAYER, name: payerName },
        event.note,
      );
      return WebhookResult.APPLIED;
    } catch (error) {
      // Received, but the lifecycle doesn't allow it (for example approving a cancelled case).
      if (error instanceof ConflictException) {
        return WebhookResult.REJECTED_INVALID_TRANSITION;
      }
      throw error;
    }
  }

  private async parseBody(body: unknown) {
    const event = plainToInstance(PayerWebhookDto, body ?? {});
    const errors = await validate(event, { whitelist: true });
    if (errors.length) {
      throw new BadRequestException(
        errors.flatMap((e) => Object.values(e.constraints ?? {})),
      );
    }
    return event;
  }
}

// Postgres error 23505: unique_violation.
const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string }).code === '23505';
