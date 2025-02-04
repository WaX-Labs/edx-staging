-- CreateTable
CREATE TABLE "ICD10" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ICD10_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ICD10_code_key" ON "ICD10"("code");

-- CreateIndex
CREATE INDEX "ICD10_code_idx" ON "ICD10"("code");

-- CreateIndex
CREATE INDEX "ICD10_display_idx" ON "ICD10"("display");
