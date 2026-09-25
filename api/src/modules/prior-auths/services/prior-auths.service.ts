import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ActorType, PriorAuthStatus } from 'src/libs/common/constants';
import {
  addDays,
  generatePayerReference,
  toDateString,
} from 'src/libs/common/helpers/utils';
import { Actor } from 'src/libs/common/types/global-types';
import { Patient } from 'src/modules/patients/entity/patient.entity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { isUUID } from 'class-validator';
import { EntityManager } from 'typeorm';
import { PriorAuthEvent } from '../entity/prior-auth-event.entity';
import { PriorAuthRequest } from '../entity/prior-auth-request.entity';
import { CreatePriorAuthDto } from '../dto/create-prior-auth.dto';
import { ListQueryDto } from '../dto/list-query.dto';
import { PriorAuthRequestRepository } from '../repository/prior-auth-request.repository';
import {
  ALLOWED,
  canTransition,
  noteRequired,
  STATUS_GROUPS,
} from '../transitions';

// Cursor = base64url of "dueBy|id", the sort key of the last row on the page.
const encodeCursor = ({ dueBy, id }: PriorAuthRequest) =>
  Buffer.from(`${dueBy}|${id}`).toString('base64url');

const decodeCursor = (cursor: string) => {
  const [dueBy, id] = Buffer.from(cursor, 'base64url').toString().split('|');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueBy) || !isUUID(id)) {
    throw new BadRequestException('Invalid cursor');
  }
  return { dueBy, id };
};

@Injectable()
export class PriorAuthsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly priorAuthRequestRepository: PriorAuthRequestRepository,
  ) {}

  async list({ status, payerId, limit, cursor }: ListQueryDto) {
    // Fetch one extra row: if it exists, there is a next page.
    const rows = await this.priorAuthRequestRepository.findQueue({
      statuses:
        status in STATUS_GROUPS
          ? STATUS_GROUPS[status as keyof typeof STATUS_GROUPS]
          : [status as PriorAuthStatus],
      payerId,
      limit: limit + 1,
      after: cursor ? decodeCursor(cursor) : undefined,
    });
    const items = rows.slice(0, limit);
    const nextCursor =
      rows.length > limit ? encodeCursor(items[items.length - 1]) : null;
    return { items, nextCursor };
  }

  async findOne(id: string) {
    const request = await this.priorAuthRequestRepository.findDetail(id);
    if (!request) {
      throw new NotFoundException('Prior auth request not found');
    }
    // Object.assign keeps the entity class, so @Exclude (version) still applies.
    return Object.assign(request, { allowedActions: ALLOWED[request.status] });
  }

  async create(dto: CreatePriorAuthDto) {
    const earliest = toDateString(addDays(new Date(), 4));
    if (dto.serviceDate < earliest) {
      throw new BadRequestException(
        `serviceDate must be on or after ${earliest}`,
      );
    }

    return this.entityManager.transaction(async (manager) => {
      if (!(await manager.exists(Patient, { where: { id: dto.patientId } }))) {
        throw new NotFoundException('Patient not found');
      }
      if (!(await manager.exists(Payer, { where: { id: dto.payerId } }))) {
        throw new NotFoundException('Payer not found');
      }

      const serviceDate = new Date(`${dto.serviceDate}T00:00:00`);
      const request = await manager.save(
        manager.create(PriorAuthRequest, {
          ...dto,
          dueBy: toDateString(addDays(serviceDate, -3)),
          status: PriorAuthStatus.DRAFT,
        }),
      );
      await manager.save(
        manager.create(PriorAuthEvent, {
          requestId: request.id,
          fromStatus: null,
          toStatus: PriorAuthStatus.DRAFT,
          actorType: ActorType.SYSTEM,
          actorName: 'System',
          note: 'Created',
        }),
      );
      return request;
    });
  }

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
