import { MigrationInterface, QueryRunner } from 'typeorm';

// Hand-ordered from the generated version, which dropped patient.memberId/payerId
// before copying them and added a NOT NULL coverageId that existing cases can't fill.
// Order: create the new table, copy the data across, then drop the old columns.
export class PatientCoverage1790338430973 implements MigrationInterface {
  name = 'PatientCoverage1790338430973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."coverage_priority" AS ENUM('PRIMARY', 'SECONDARY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient_coverage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "patientId" uuid NOT NULL, "payerId" uuid NOT NULL, "memberId" character varying NOT NULL, "priority" "public"."coverage_priority" NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_21ae223bf91caaf45204bb6bf8f" PRIMARY KEY ("id"))`,
    );

    // 1. Each patient's existing payer + member ID becomes their PRIMARY coverage.
    await queryRunner.query(
      `INSERT INTO "patient_coverage" ("patientId", "payerId", "memberId", "priority")
       SELECT "id", "payerId", "memberId", 'PRIMARY' FROM "patient"`,
    );
    // 2. Cases billed to a payer the patient didn't have (the old form allowed it) keep
    //    working: they get an inactive coverage flagged for cleanup, so no case is lost.
    await queryRunner.query(
      `INSERT INTO "patient_coverage" ("patientId", "payerId", "memberId", "priority", "active")
       SELECT DISTINCT r."patientId", r."payerId", 'UNKNOWN', 'SECONDARY'::"public"."coverage_priority", false
       FROM "prior_auth_request" r
       WHERE NOT EXISTS (SELECT 1 FROM "patient_coverage" c
                         WHERE c."patientId" = r."patientId" AND c."payerId" = r."payerId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_coverage_patient_priority" ON "patient_coverage" ("patientId", "priority") WHERE "active" = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_coverage_patient_payer" ON "patient_coverage" ("patientId", "payerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" ADD CONSTRAINT "FK_b1b2f0e3cfe2049f54218248cbc" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" ADD CONSTRAINT "FK_caf1deaf8c8f6ea115b08ee0b11" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 3. Point every case at its coverage: add nullable, fill, then require it.
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ADD "coverageId" uuid`,
    );
    await queryRunner.query(
      `UPDATE "prior_auth_request" r SET "coverageId" = c."id"
       FROM "patient_coverage" c
       WHERE c."patientId" = r."patientId" AND c."payerId" = r."payerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ALTER COLUMN "coverageId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ADD CONSTRAINT "FK_41451182f327afb70bed885a350" FOREIGN KEY ("coverageId") REFERENCES "patient_coverage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // 4. Only now drop the old columns: their data lives in patient_coverage.
    await queryRunner.query(
      `ALTER TABLE "patient" DROP CONSTRAINT "FK_e1bac893c4ee889e0686e686665"`,
    );
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "memberId"`);
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "payerId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order: restore the patient columns from the PRIMARY coverage first.
    await queryRunner.query(`ALTER TABLE "patient" ADD "payerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "patient" ADD "memberId" character varying`,
    );
    await queryRunner.query(
      `UPDATE "patient" p SET "payerId" = c."payerId", "memberId" = c."memberId"
       FROM "patient_coverage" c
       WHERE c."patientId" = p."id" AND c."priority" = 'PRIMARY' AND c."active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ALTER COLUMN "payerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ALTER COLUMN "memberId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ADD CONSTRAINT "FK_e1bac893c4ee889e0686e686665" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" DROP CONSTRAINT "FK_41451182f327afb70bed885a350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" DROP COLUMN "coverageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" DROP CONSTRAINT "FK_caf1deaf8c8f6ea115b08ee0b11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_coverage" DROP CONSTRAINT "FK_b1b2f0e3cfe2049f54218248cbc"`,
    );
    await queryRunner.query(`DROP INDEX "public"."uq_coverage_patient_payer"`);
    await queryRunner.query(
      `DROP INDEX "public"."uq_coverage_patient_priority"`,
    );
    await queryRunner.query(`DROP TABLE "patient_coverage"`);
    await queryRunner.query(`DROP TYPE "public"."coverage_priority"`);
  }
}
