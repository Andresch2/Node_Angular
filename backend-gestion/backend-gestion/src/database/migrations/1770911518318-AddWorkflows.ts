import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkflows1770911518318 implements MigrationInterface {
  name = 'AddWorkflows1770911518318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."workflow_node_type_enum" AS ENUM('ACTION', 'CONDITION', 'DELAY', 'NOTIFICATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "workflow_node" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."workflow_node_type_enum" NOT NULL DEFAULT 'ACTION', "config" jsonb, "position" integer NOT NULL DEFAULT '0', "workflowId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c4f72dce8fedd10b6104af42b57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workflow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "inngestEventName" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb5e4cc1a9ef2e94805b676751b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_node" ADD CONSTRAINT "FK_d3cacae8a001b006c3f7f4bbf81" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workflow_node" DROP CONSTRAINT "FK_d3cacae8a001b006c3f7f4bbf81"`,
    );
    await queryRunner.query(`DROP TABLE "workflow"`);
    await queryRunner.query(`DROP TABLE "workflow_node"`);
    await queryRunner.query(`DROP TYPE "public"."workflow_node_type_enum"`);
  }
}
