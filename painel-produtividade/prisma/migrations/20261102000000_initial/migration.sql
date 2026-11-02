BEGIN;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ImportKind" AS ENUM ('MANUAL', 'FILE', 'GOOGLE_SHEETS');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('PENDING', 'VALIDATED', 'APPLIED', 'FAILED');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_operation_access" (
    "user_id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_operation_access_pkey" PRIMARY KEY ("user_id","operation_id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "external_id" VARCHAR(200),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "external_id" VARCHAR(200),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productivity_records" (
    "id" UUID NOT NULL,
    "reference_month" DATE NOT NULL,
    "operation_id" UUID NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "contract" VARCHAR(200) NOT NULL,
    "production" DECIMAL(14,2) NOT NULL,
    "goal_met" BOOLEAN,
    "controller" VARCHAR(200),
    "status" VARCHAR(200),
    "source" VARCHAR(200) NOT NULL,
    "source_row_key" VARCHAR(200) NOT NULL,
    "import_batch_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "productivity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "source" VARCHAR(200) NOT NULL,
    "kind" "ImportKind" NOT NULL,
    "file_name" VARCHAR(255),
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'PENDING',
    "rows_received" INTEGER NOT NULL DEFAULT 0,
    "rows_imported" INTEGER NOT NULL DEFAULT 0,
    "rows_rejected" INTEGER NOT NULL DEFAULT 0,
    "checksum" VARCHAR(64),
    "executed_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(120) NOT NULL,
    "entity" VARCHAR(80) NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "user_operation_access_operation_id_idx" ON "user_operation_access"("operation_id");

-- CreateIndex
CREATE UNIQUE INDEX "operations_normalized_name_key" ON "operations"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_external_id_key" ON "supervisors"("external_id");

-- CreateIndex
CREATE INDEX "supervisors_normalized_name_idx" ON "supervisors"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_external_id_key" ON "technicians"("external_id");

-- CreateIndex
CREATE INDEX "technicians_normalized_name_idx" ON "technicians"("normalized_name");

-- CreateIndex
CREATE INDEX "productivity_records_reference_month_operation_id_superviso_idx" ON "productivity_records"("reference_month", "operation_id", "supervisor_id");

-- CreateIndex
CREATE INDEX "productivity_records_operation_id_supervisor_id_idx" ON "productivity_records"("operation_id", "supervisor_id");

-- CreateIndex
CREATE INDEX "productivity_records_technician_id_reference_month_idx" ON "productivity_records"("technician_id", "reference_month");

-- CreateIndex
CREATE INDEX "productivity_records_import_batch_id_idx" ON "productivity_records"("import_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "productivity_records_source_source_row_key_key" ON "productivity_records"("source", "source_row_key");

-- CreateIndex
CREATE INDEX "import_batches_source_checksum_idx" ON "import_batches"("source", "checksum");

-- CreateIndex
CREATE INDEX "import_batches_executed_by_created_at_idx" ON "import_batches"("executed_by", "created_at");

-- CreateIndex
CREATE INDEX "import_batches_status_created_at_idx" ON "import_batches"("status", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_created_at_idx" ON "audit_logs"("entity", "entity_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_operation_access" ADD CONSTRAINT "user_operation_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_operation_access" ADD CONSTRAINT "user_operation_access_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productivity_records" ADD CONSTRAINT "productivity_records_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productivity_records" ADD CONSTRAINT "productivity_records_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productivity_records" ADD CONSTRAINT "productivity_records_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productivity_records" ADD CONSTRAINT "productivity_records_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Application invariants that are not expressible in Prisma's schema DSL.
ALTER TABLE public."productivity_records"
  ADD CONSTRAINT "productivity_records_month_first_day"
  CHECK (EXTRACT(DAY FROM "reference_month") = 1);

ALTER TABLE public."import_batches"
  ADD CONSTRAINT "import_batches_nonnegative_counts"
  CHECK ("rows_received" >= 0 AND "rows_imported" >= 0 AND "rows_rejected" >= 0);

-- Default deny: data is available through authorized server services only.
ALTER TABLE public."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_operation_access" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."operations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."supervisors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."productivity_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."import_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."audit_logs" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."user_profiles", public."user_operation_access",
  public."operations", public."supervisors", public."technicians",
  public."productivity_records", public."import_batches", public."audit_logs"
  FROM PUBLIC;

-- Supabase roles may not exist in an isolated vanilla PostgreSQL development DB.
DO $permissions$
DECLARE
  role_name text;
  table_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      FOREACH table_name IN ARRAY ARRAY[
        'user_profiles', 'user_operation_access', 'operations', 'supervisors',
        'technicians', 'productivity_records', 'import_batches', 'audit_logs'
      ] LOOP
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', table_name, role_name);
      END LOOP;
    END IF;
  END LOOP;
END;
$permissions$;

COMMIT;
