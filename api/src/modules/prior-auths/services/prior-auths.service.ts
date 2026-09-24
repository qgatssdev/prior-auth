import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PriorAuthStatus } from 'src/libs/common/constants';
import { generatePayerReference } from 'src/libs/common/helpers/utils';
import { Actor } from 'src/libs/common/types/global-types';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { EntityManager } from 'typeorm';
import { PriorAuthEvent } from '../entity/prior-auth-event.entity';
import { PriorAuthRequest } from '../entity/prior-auth-request.entity';
import { canTransition, noteRequired } from '../transitions';

@Injectable()
export class PriorAuthsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // The only code path that changes a status. Used by the UI and the webhook.
  async transition(
    id: string,
    toStatus: PriorAuthStatus,
    actor: Actor,
    note?: string,
  ): Promise<PriorAuthRequest> {
    const trimmedNote = note?.trim() || null;

    // One transaction: the status change and its audit event are saved together or not at all.
    return this.entityManager.transaction(async (manager) => {
      // Row lock: a second transition on the same case waits here until this one commits.
      // No relations in this query: Postgres can't lock the nullable side of an outer join.
      const request = await manager.findOne(PriorAuthRequest, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) {
        throw new NotFoundException('Prior auth request not found');
      }

      const fromStatus = request.status;
      if (!canTransition(fromStatus, toStatus)) {
        throw new ConflictException(
          `Cannot move from ${fromStatus} to ${toStatus}`,
        );
      }
      if (noteRequired(fromStatus, toStatus) && !trimmedNote) {
        throw new BadRequestException('A note is required');
      }

      if (toStatus === PriorAuthStatus.SUBMITTED && !request.payerReference) {
        request.payerReference = await this.newPayerReference(
          manager,
          request.payerId,
        );
      }

      request.status = toStatus;
      await manager.save(request);

      await manager.save(
        manager.create(PriorAuthEvent, {
          requestId: request.id,
          fromStatus,
          toStatus,
          actorType: actor.type,
          actorName: actor.name,
          note: trimmedNote,
        }),
      );

      return request;
    });
  }

  // Random, so check it isn't already used by this payer (the unique index would reject it).
  private async newPayerReference(manager: EntityManager, payerId: string) {
    const payer = await manager.findOneByOrFail(Payer, { id: payerId });
    let reference: string;
    do {
      reference = generatePayerReference(payer.slug);
    } while (
      await manager.exists(PriorAuthRequest, {
        where: { payerId, payerReference: reference },
      })
    );
    return reference;
  }
}
