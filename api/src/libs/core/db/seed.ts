import { randomBytes } from 'crypto';
import { ActorType, PriorAuthStatus } from 'src/libs/common/constants';
import {
  addDays,
  generatePayerReference,
  payerPrefix,
  randomInt,
  toDateString,
} from 'src/libs/common/helpers/utils';
import { Patient } from 'src/modules/patients/entity/patient.entity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { PriorAuthEvent } from 'src/modules/prior-auths/entity/prior-auth-event.entity';
import { PriorAuthRequest } from 'src/modules/prior-auths/entity/prior-auth-request.entity';
import dataSource from './typeOrm.config';

const {
  DRAFT,
  SUBMITTED,
  PENDING_PAYER,
  NEEDS_INFO,
  APPROVED,
  DENIED,
  APPEALED,
  CANCELLED,
} = PriorAuthStatus;

const PAYERS = [
  { name: 'Acme Health', slug: 'acme-health', avgTurnaroundDays: 2 },
  { name: 'Summit Mutual', slug: 'summit-mutual', avgTurnaroundDays: 5 },
  { name: 'Beacon Care', slug: 'beacon-care', avgTurnaroundDays: 7 },
];

const PATIENT_NAMES = [
  ['Ada', 'Testperson'],
  ['Bruno', 'Placeholder'],
  ['Clara', 'Sampleton'],
  ['Dev', 'Mockridge'],
  ['Edna', 'Fakewell'],
  ['Felix', 'Dummington'],
  ['Greta', 'Exampleby'],
  ['Hugo', 'Specimen'],
  ['Iris', 'Notreal'],
  ['Jonas', 'Stubbs'],
  ['Kira', 'Fixture'],
  ['Leon', 'Prototype'],
  ['Mona', 'Demoson'],
  ['Nils', 'Pseudonym'],
  ['Olga', 'Trialby'],
];

const TREATMENTS = [
  {
    treatmentName: 'Aflibercept injection',
    cptCode: '67028',
    icd10Code: 'H35.32',
  },
  { treatmentName: 'Cataract surgery', cptCode: '66984', icd10Code: 'H25.9' },
  { treatmentName: 'Retina laser', cptCode: '67210', icd10Code: 'H35.32' },
];

const STATUS_COUNTS: [PriorAuthStatus, number][] = [
  [DRAFT, 8],
  [SUBMITTED, 8],
  [PENDING_PAYER, 12],
  [NEEDS_INFO, 5],
  [APPROVED, 7],
  [DENIED, 5],
  [APPEALED, 3],
  [CANCELLED, 2],
];

type Step = { to: PriorAuthStatus; actor: ActorType; note?: string };

// The valid path of transitions that leads to each status (after the SYSTEM "Created" event).
const SUBMIT: Step = { to: SUBMITTED, actor: ActorType.USER };
const PENDING: Step = { to: PENDING_PAYER, actor: ActorType.PAYER };
const DENY: Step = {
  to: DENIED,
  actor: ActorType.PAYER,
  note: 'Step therapy required: prior bevacizumab trial not documented.',
};
const HISTORY: Record<PriorAuthStatus, Step[]> = {
  DRAFT: [],
  SUBMITTED: [SUBMIT],
  PENDING_PAYER: [SUBMIT, PENDING],
  NEEDS_INFO: [
    SUBMIT,
    PENDING,
    {
      to: NEEDS_INFO,
      actor: ActorType.PAYER,
      note: 'Please send the latest OCT scan and visual acuity results.',
    },
  ],
  APPROVED: [SUBMIT, PENDING, { to: APPROVED, actor: ActorType.PAYER }],
  DENIED: [SUBMIT, PENDING, DENY],
  APPEALED: [
    SUBMIT,
    PENDING,
    DENY,
    {
      to: APPEALED,
      actor: ActorType.USER,
      note: 'Appeal sent with letter of medical necessity and treatment history.',
    },
  ],
  CANCELLED: [
    {
      to: CANCELLED,
      actor: ActorType.USER,
      note: 'Patient rescheduled with another clinic.',
    },
  ],
};

const pick = <T>(items: T[]) => items[randomInt(0, items.length - 1)];

async function seed() {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    // Wipe everything so the seed is safe to re-run.
    await manager.query(
      'TRUNCATE prior_auth_event, prior_auth_request, payer_webhook_event, patient, payer CASCADE',
    );

    const payers = await manager.save(
      PAYERS.map((payer) =>
        manager.create(Payer, {
          ...payer,
          webhookSecret: randomBytes(32).toString('hex'),
        }),
      ),
    );

    const patients = await manager.save(
      PATIENT_NAMES.map(([firstName, lastName]) => {
        const payer = pick(payers);
        return manager.create(Patient, {
          firstName,
          lastName,
          dateOfBirth: `${randomInt(1940, 1965)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
          memberId: `${payerPrefix(payer.slug).slice(0, 3)}-${randomInt(100000, 999999)}`,
          payerId: payer.id,
        });
      }),
    );

    const usedReferences = new Set<string>();
    const statuses = STATUS_COUNTS.flatMap(([status, count]) =>
      Array<PriorAuthStatus>(count).fill(status),
    );

    for (const status of statuses) {
      const patient = pick(patients);
      const payer = payers.find((p) => p.id === patient.payerId)!;
      const serviceDate = addDays(new Date(), randomInt(2, 30));
      const steps = HISTORY[status];

      let payerReference: string | null = null;
      if (steps.some((step) => step.to === SUBMITTED)) {
        do payerReference = generatePayerReference(payer.slug);
        while (usedReferences.has(payerReference));
        usedReferences.add(payerReference);
      }

      // Created 3-6 days ago, then each step a few hours after the previous one.
      let time = new Date(Date.now() - randomInt(3 * 24, 6 * 24) * 3600_000);
      const createdAt = time;
      const events: Partial<PriorAuthEvent>[] = [
        {
          fromStatus: null,
          toStatus: DRAFT,
          actorType: ActorType.SYSTEM,
          actorName: 'System',
          note: 'Created',
          createdAt,
        },
      ];
      let from = DRAFT;
      for (const step of steps) {
        time = new Date(time.getTime() + randomInt(2, 18) * 3600_000);
        events.push({
          fromStatus: from,
          toStatus: step.to,
          actorType: step.actor,
          actorName:
            step.actor === ActorType.PAYER ? payer.name : 'Demo specialist',
          note: step.note ?? null,
          createdAt: time,
        });
        from = step.to;
      }

      const request = await manager.save(
        manager.create(PriorAuthRequest, {
          patientId: patient.id,
          payerId: payer.id,
          ...pick(TREATMENTS),
          serviceDate: toDateString(serviceDate),
          dueBy: toDateString(addDays(serviceDate, -3)),
          status,
          payerReference,
          createdAt,
          updatedAt: time,
        }),
      );
      await manager.save(
        events.map((event) =>
          manager.create(PriorAuthEvent, { ...event, requestId: request.id }),
        ),
      );
    }
  });

  console.log(
    `Seeded ${PAYERS.length} payers, ${PATIENT_NAMES.length} patients, 50 cases.`,
  );
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  await dataSource.destroy();
  process.exit(1);
});
