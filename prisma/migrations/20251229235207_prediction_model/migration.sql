-- CreateTable
CREATE TABLE "PredictionModel" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "constant" DOUBLE PRECISION NOT NULL,
    "coeffImpresi" DOUBLE PRECISION NOT NULL,
    "coeffWarna" DOUBLE PRECISION NOT NULL,
    "coeffSisi" DOUBLE PRECISION NOT NULL,
    "coeffJilid" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionModel_pkey" PRIMARY KEY ("id")
);
