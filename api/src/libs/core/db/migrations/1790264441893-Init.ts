import { MigrationInterface, QueryRunner } from 'typeorm';

// Hand-edited: TypeORM emitted CREATE/DROP TYPE prior_auth_status twice because two tables share the enum.
export class Init1790264441893 implements MigrationInterface {
  name = 'Init1790264441893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "name" character varying NOT NULL, "slug" character varying NOT NULL, "webhookSecret" character varying NOT NULL, "avgTurnaroundDays" integer NOT NULL, CONSTRAINT "UQ_30f814cce352e9f70a2b2bc0e1e" UNIQUE ("slug"), CONSTRAINT "PK_b397f4290f45cd2e824c63200f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payer_webhook_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "payerId" uuid NOT NULL, "externalEventId" character varying NOT NULL, "payload" jsonb NOT NULL, "signatureValid" boolean NOT NULL, "result" character varying, "processedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e1451e953789f9007ca844bd7be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_webhook_payer_event" ON "payer_webhook_event" ("payerId", "externalEventId") WHERE "signatureValid" = true`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "dateOfBirth" date NOT NULL, "memberId" character varying NOT NULL, "payerId" uuid NOT NULL, CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."prior_auth_status" AS ENUM('DRAFT', 'SUBMITTED', 'PENDING_PAYER', 'NEEDS_INFO', 'APPROVED', 'DENIED', 'APPEALED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actor_type" AS ENUM('USER', 'PAYER', 'SYSTEM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "prior_auth_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requestId" uuid NOT NULL, "fromStatus" "public"."prior_auth_status", "toStatus" "public"."prior_auth_status" NOT NULL, "actorType" "public"."actor_type" NOT NULL, "actorName" character varying NOT NULL, "note" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24a528f1c2a971021ef2513061c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pa_event_request_created" ON "prior_auth_event" ("requestId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "prior_auth_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '0', "patientId" uuid NOT NULL, "payerId" uuid NOT NULL, "treatmentName" character varying NOT NULL, "cptCode" character varying NOT NULL, "icd10Code" character varying NOT NULL, "serviceDate" date NOT NULL, "dueBy" date NOT NULL, "status" "public"."prior_auth_status" NOT NULL DEFAULT 'DRAFT', "payerReference" character varying, CONSTRAINT "PK_f0090a3e843312e61bafd4cf9c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_pa_payer_ref" ON "prior_auth_request" ("payerId", "payerReference") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pa_status_due_id" ON "prior_auth_request" ("status", "dueBy", "id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payer_webhook_event" ADD CONSTRAINT "FK_4cf16299f391b3672963f22308e" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ADD CONSTRAINT "FK_e1bac893c4ee889e0686e686665" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_event" ADD CONSTRAINT "FK_90a332889b9e9da93c5ec7c6a3e" FOREIGN KEY ("requestId") REFERENCES "prior_auth_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ADD CONSTRAINT "FK_15a7c71e1cb222e0e9a7b746882" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" ADD CONSTRAINT "FK_3954c2e82ad4a56b04f22087e41" FOREIGN KEY ("payerId") REFERENCES "payer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" DROP CONSTRAINT "FK_3954c2e82ad4a56b04f22087e41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_request" DROP CONSTRAINT "FK_15a7c71e1cb222e0e9a7b746882"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prior_auth_event" DROP CONSTRAINT "FK_90a332889b9e9da93c5ec7c6a3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" DROP CONSTRAINT "FK_e1bac893c4ee889e0686e686665"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payer_webhook_event" DROP CONSTRAINT "FK_4cf16299f391b3672963f22308e"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_pa_status_due_id"`);
    await queryRunner.query(`DROP INDEX "public"."uq_pa_payer_ref"`);
    await queryRunner.query(`DROP TABLE "prior_auth_request"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_pa_event_request_created"`,
    );
    await queryRunner.query(`DROP TABLE "prior_auth_event"`);
    await queryRunner.query(`DROP TYPE "public"."actor_type"`);
    await queryRunner.query(`DROP TYPE "public"."prior_auth_status"`);
    await queryRunner.query(`DROP TABLE "patient"`);
    await queryRunner.query(`DROP INDEX "public"."uq_webhook_payer_event"`);
    await queryRunner.query(`DROP TABLE "payer_webhook_event"`);
    await queryRunner.query(`DROP TABLE "payer"`);
  }
}
