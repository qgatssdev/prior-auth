import { InjectEntityManager } from '@nestjs/typeorm';
import { PriorAuthStatus } from 'src/libs/common/constants';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { EntityManager } from 'typeorm';
import { PriorAuthRequest } from '../entity/prior-auth-request.entity';

export interface QueueFilter {
  statuses: PriorAuthStatus[];
  payerId?: string;
  limit: number;
  after?: { dueBy: string; id: string };
}

export class PriorAuthRequestRepository extends BaseRepository<PriorAuthRequest> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(PriorAuthRequest));
  }

  // Keyset pagination on (dueBy, id): served by idx_pa_status_due_id, no OFFSET scan.
  findQueue({ statuses, payerId, limit, after }: QueueFilter) {
    const query = this.createQueryBuilder('pa')
      .leftJoin('pa.patient', 'patient')
      .leftJoin('pa.payer', 'payer')
      .leftJoin('pa.coverage', 'coverage')
      .addSelect([
        'patient.id',
        'patient.firstName',
        'patient.lastName',
        'payer.id',
        'payer.name',
        'payer.slug',
        'coverage.id',
        'coverage.memberId',
        'coverage.priority',
      ])
      .where('pa.status IN (:...statuses)', { statuses })
      .orderBy('pa.dueBy', 'ASC')
      .addOrderBy('pa.id', 'ASC')
      .limit(limit);

    if (payerId) {
      query.andWhere('pa.payerId = :payerId', { payerId });
    }
    if (after) {
      query.andWhere(
        '(pa.dueBy > :dueBy OR (pa.dueBy = :dueBy AND pa.id > :id))',
        after,
      );
    }
    return query.getMany();
  }

  findDetail(id: string) {
    return this.findOne({
      where: { id },
      relations: { patient: true, payer: true, coverage: true, events: true },
      order: { events: { createdAt: 'ASC' } },
    });
  }

  async countStats(openStatuses: PriorAuthStatus[]) {
    const row = await this.createQueryBuilder('pa')
      .select(`COUNT(*) FILTER (WHERE pa.status = :needsInfo)`, 'needsInfo')
      .addSelect(
        `COUNT(*) FILTER (WHERE pa.status IN (:submitted, :pendingPayer))`,
        'pendingPayer',
      )
      // Includes overdue cases: they are the most urgent of all.
      .addSelect(
        `COUNT(*) FILTER (WHERE pa.status IN (:...open) AND pa.dueBy <= CURRENT_DATE + 2)`,
        'dueSoon',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE pa.status = :denied)`,
        'deniedAppealable',
      )
      .setParameters({
        needsInfo: PriorAuthStatus.NEEDS_INFO,
        submitted: PriorAuthStatus.SUBMITTED,
        pendingPayer: PriorAuthStatus.PENDING_PAYER,
        denied: PriorAuthStatus.DENIED,
        open: openStatuses,
      })
      .getRawOne<Record<string, string>>();

    // Postgres returns COUNT as a string (bigint).
    return {
      needsInfo: Number(row?.needsInfo),
      pendingPayer: Number(row?.pendingPayer),
      dueSoon: Number(row?.dueSoon),
      deniedAppealable: Number(row?.deniedAppealable),
    };
  }
}
