import { MigrationInterface, QueryRunner } from 'typeorm';

// The queue now sorts by last update. updatedAt becomes millisecond precision so the
// keyset cursor (which passes through a JavaScript Date) matches the stored value exactly.
// ALTER TYPE keeps the data (existing values round to the millisecond).
// Hand-edited: TypeORM's down() recreated idx_pa_status_due_id with its columns reversed.
export class QueueByLastUpdate1790347537148 implements MigrationInterface {
  name = 'QueueByLastUpdate1790347537148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_pa_status_due_id"`);
    await queryRunner.query(
      `ALTER TABLE "payer" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payer_webhook_event" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pa_status_updated_id" ON "prior_auth_request" ("status", "updatedAt", "id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_pa_status_updated_id"`);
    await queryRunner.query(
      `ALTER TABLE "payer_webhook_event" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "payer" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6) WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pa_status_due_id" ON "prior_auth_request" ("status", "dueBy", "id") `,
    );
  }
}
