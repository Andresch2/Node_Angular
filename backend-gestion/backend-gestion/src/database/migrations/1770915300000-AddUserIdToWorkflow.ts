import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToWorkflow1770915300000 implements MigrationInterface {
    name = 'AddUserIdToWorkflow1770915300000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workflow" ADD "userId" integer`);
        await queryRunner.query(
            `ALTER TABLE "workflow" ADD CONSTRAINT "FK_5c43d4a3144b7c40bcfd7071440" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workflow" DROP CONSTRAINT "FK_5c43d4a3144b7c40bcfd7071440"`,
        );
        await queryRunner.query(`ALTER TABLE "workflow" DROP COLUMN "userId"`);
    }
}
