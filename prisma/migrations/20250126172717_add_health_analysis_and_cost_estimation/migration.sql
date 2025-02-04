-- CreateTable
CREATE TABLE "HealthAnalysis" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimation" (
    "id" TEXT NOT NULL,
    "healthAnalysisId" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "medicines" JSONB NOT NULL,
    "facilities" JSONB NOT NULL,
    "totalCost" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostEstimation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthAnalysis_createdAt_idx" ON "HealthAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "CostEstimation_healthAnalysisId_idx" ON "CostEstimation"("healthAnalysisId");

-- CreateIndex
CREATE INDEX "CostEstimation_createdAt_idx" ON "CostEstimation"("createdAt");

-- AddForeignKey
ALTER TABLE "CostEstimation" ADD CONSTRAINT "CostEstimation_healthAnalysisId_fkey" FOREIGN KEY ("healthAnalysisId") REFERENCES "HealthAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
