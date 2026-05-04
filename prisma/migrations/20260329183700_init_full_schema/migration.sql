-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('DRIVER', 'TRANSPORTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('PENDING', 'PAID', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('WAVE', 'ORANGE', 'FREE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('ASSURE', 'SOUSCRIPTEUR');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('PHYSIQUE', 'MORALE');

-- CreateEnum
CREATE TYPE "Periodicity" AS ENUM ('JOUR', 'MOIS');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ATTESTATION', 'RECEIPT', 'GREEN_CARD', 'CONDITIONS_GENERALES', 'AVENANT');

-- CreateEnum
CREATE TYPE "EnergyType" AS ENUM ('ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE');

-- CreateEnum
CREATE TYPE "VehicleUsage" AS ENUM ('COMMERCIAL', 'NON_COMMERCIAL');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('MONO', 'MOTO', 'FLOTTE', 'BUS_ECOLE', 'REMORQUE', 'GARAGE', 'AUTO_ECOLE', 'LOCATION');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('BASIC', 'API_KEY', 'OAUTH2', 'JWT');

-- CreateEnum
CREATE TYPE "CancellationMethod" AS ENUM ('ANNULER', 'RESILIER', 'SUSPENDRE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCategory" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGenre" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "requiresCylinder" BOOLEAN NOT NULL DEFAULT false,
    "requiresUsage" BOOLEAN NOT NULL DEFAULT false,
    "requiresNbCartes" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VehicleGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "energyType" "EnergyType" NOT NULL,
    "licensePlate" TEXT,
    "chassis" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "fiscalPower" INTEGER,
    "numberOfSeats" INTEGER,
    "cylinderVolume" INTEGER,
    "usage" "VehicleUsage",
    "circulationDate" TIMESTAMP(3),
    "valueNew" DECIMAL(15,2),
    "valueCurrent" DECIMAL(15,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "apiBaseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompanyCredential" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "encryptedPayload" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "InsuranceCompanyCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyQrStock" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lowThreshold" INTEGER NOT NULL DEFAULT 10,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyQrStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceProduct" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InsuranceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceQuote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "fleetId" INTEGER,
    "duration" INTEGER NOT NULL,
    "periodicity" "Periodicity" NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "externalRequestId" TEXT,
    "rawRequest" JSONB,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quoteId" INTEGER,
    "fleetId" INTEGER,
    "policyNumber" TEXT NOT NULL,
    "externalPartnerRef" TEXT NOT NULL,
    "towingVehicleRef" TEXT,
    "duration" INTEGER NOT NULL,
    "periodicity" "Periodicity" NOT NULL,
    "responsibilityCivilAmount" DECIMAL(15,2),
    "status" "InsuranceStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceDetail" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "assureSnapshot" JSONB,
    "souscripteurSnapshot" JSONB,
    "vehicleSnapshot" JSONB,
    "nombreCarte" INTEGER,
    "attestationNumber" TEXT,
    "linkAttestation" TEXT,
    "linkCarteBrune" TEXT,
    "rawRequest" JSONB,
    "rawResponse" JSONB,

    CONSTRAINT "InsuranceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceGuarantee" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(15,2),

    CONSTRAINT "InsuranceGuarantee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceStatusLog" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "fromStatus" "InsuranceStatus",
    "toStatus" "InsuranceStatus" NOT NULL,
    "reason" TEXT,
    "changedBy" INTEGER,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCancellation" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "method" "CancellationMethod" NOT NULL,
    "motif" TEXT,
    "requestedBy" INTEGER,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiStatus" TEXT,
    "apiMessage" TEXT,
    "apiRawResponse" JSONB,

    CONSTRAINT "InsuranceCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceParty" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" "PartyType" NOT NULL,
    "personType" "PersonType" NOT NULL DEFAULT 'PHYSIQUE',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "InsuranceParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "taxAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "externalTransactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceDocument" (
    "id" SERIAL NOT NULL,
    "insuranceId" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isExternalUrl" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fleet" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetVehicle" (
    "id" SERIAL NOT NULL,
    "fleetId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "OtpCode_phone_isUsed_idx" ON "OtpCode"("phone", "isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_isRevoked_idx" ON "RefreshToken"("userId", "isRevoked");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategory_code_key" ON "VehicleCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleGenre_code_key" ON "VehicleGenre"("code");

-- CreateIndex
CREATE INDEX "VehicleGenre_categoryId_idx" ON "VehicleGenre"("categoryId");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");

-- CreateIndex
CREATE INDEX "Vehicle_licensePlate_idx" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_genreId_idx" ON "Vehicle"("genreId");

-- CreateIndex
CREATE INDEX "Vehicle_deletedAt_idx" ON "Vehicle"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_code_key" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE INDEX "InsuranceCompany_deletedAt_idx" ON "InsuranceCompany"("deletedAt");

-- CreateIndex
CREATE INDEX "InsuranceCompanyCredential_companyId_isActive_idx" ON "InsuranceCompanyCredential"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompanyCredential_companyId_partnerCode_key" ON "InsuranceCompanyCredential"("companyId", "partnerCode");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyQrStock_companyId_key" ON "CompanyQrStock"("companyId");

-- CreateIndex
CREATE INDEX "InsuranceProduct_companyId_category_isActive_idx" ON "InsuranceProduct"("companyId", "category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceProduct_companyId_code_key" ON "InsuranceProduct"("companyId", "code");

-- CreateIndex
CREATE INDEX "InsuranceQuote_userId_idx" ON "InsuranceQuote"("userId");

-- CreateIndex
CREATE INDEX "InsuranceQuote_userId_createdAt_idx" ON "InsuranceQuote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InsuranceQuote_vehicleId_idx" ON "InsuranceQuote"("vehicleId");

-- CreateIndex
CREATE INDEX "InsuranceQuote_companyId_idx" ON "InsuranceQuote"("companyId");

-- CreateIndex
CREATE INDEX "InsuranceQuote_fleetId_idx" ON "InsuranceQuote"("fleetId");

-- CreateIndex
CREATE INDEX "InsuranceQuote_createdAt_idx" ON "InsuranceQuote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Insurance_quoteId_key" ON "Insurance"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Insurance_policyNumber_key" ON "Insurance"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Insurance_externalPartnerRef_key" ON "Insurance"("externalPartnerRef");

-- CreateIndex
CREATE INDEX "Insurance_userId_idx" ON "Insurance"("userId");

-- CreateIndex
CREATE INDEX "Insurance_userId_status_idx" ON "Insurance"("userId", "status");

-- CreateIndex
CREATE INDEX "Insurance_vehicleId_idx" ON "Insurance"("vehicleId");

-- CreateIndex
CREATE INDEX "Insurance_status_idx" ON "Insurance"("status");

-- CreateIndex
CREATE INDEX "Insurance_companyId_status_idx" ON "Insurance"("companyId", "status");

-- CreateIndex
CREATE INDEX "Insurance_fleetId_idx" ON "Insurance"("fleetId");

-- CreateIndex
CREATE INDEX "Insurance_startDate_idx" ON "Insurance"("startDate");

-- CreateIndex
CREATE INDEX "Insurance_endDate_idx" ON "Insurance"("endDate");

-- CreateIndex
CREATE INDEX "Insurance_deletedAt_idx" ON "Insurance"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceDetail_insuranceId_key" ON "InsuranceDetail"("insuranceId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceGuarantee_insuranceId_code_key" ON "InsuranceGuarantee"("insuranceId", "code");

-- CreateIndex
CREATE INDEX "InsuranceStatusLog_insuranceId_idx" ON "InsuranceStatusLog"("insuranceId");

-- CreateIndex
CREATE INDEX "InsuranceStatusLog_changedAt_idx" ON "InsuranceStatusLog"("changedAt");

-- CreateIndex
CREATE INDEX "InsuranceCancellation_insuranceId_idx" ON "InsuranceCancellation"("insuranceId");

-- CreateIndex
CREATE INDEX "InsuranceCancellation_requestedAt_idx" ON "InsuranceCancellation"("requestedAt");

-- CreateIndex
CREATE INDEX "InsuranceParty_insuranceId_idx" ON "InsuranceParty"("insuranceId");

-- CreateIndex
CREATE INDEX "InsuranceParty_userId_idx" ON "InsuranceParty"("userId");

-- CreateIndex
CREATE INDEX "InsuranceParty_phone_idx" ON "InsuranceParty"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceParty_insuranceId_type_key" ON "InsuranceParty"("insuranceId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_reference_key" ON "Invoice"("reference");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "InvoiceItem_insuranceId_idx" ON "InvoiceItem"("insuranceId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_invoiceId_insuranceId_key" ON "InvoiceItem"("invoiceId", "insuranceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalTransactionId_key" ON "Payment"("externalTransactionId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentEvent_paymentId_idx" ON "PaymentEvent"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentEvent_eventType_idx" ON "PaymentEvent"("eventType");

-- CreateIndex
CREATE INDEX "InsuranceDocument_insuranceId_documentType_idx" ON "InsuranceDocument"("insuranceId", "documentType");

-- CreateIndex
CREATE INDEX "InsuranceDocument_insuranceId_createdAt_idx" ON "InsuranceDocument"("insuranceId", "createdAt");

-- CreateIndex
CREATE INDEX "Fleet_ownerId_idx" ON "Fleet"("ownerId");

-- CreateIndex
CREATE INDEX "Fleet_deletedAt_idx" ON "Fleet"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Fleet_ownerId_reference_key" ON "Fleet"("ownerId", "reference");

-- CreateIndex
CREATE INDEX "FleetVehicle_fleetId_idx" ON "FleetVehicle"("fleetId");

-- CreateIndex
CREATE INDEX "FleetVehicle_vehicleId_idx" ON "FleetVehicle"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_fleetId_vehicleId_key" ON "FleetVehicle"("fleetId", "vehicleId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGenre" ADD CONSTRAINT "VehicleGenre_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "VehicleGenre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCompanyCredential" ADD CONSTRAINT "InsuranceCompanyCredential_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQrStock" ADD CONSTRAINT "CompanyQrStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceProduct" ADD CONSTRAINT "InsuranceProduct_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceQuote" ADD CONSTRAINT "InsuranceQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceQuote" ADD CONSTRAINT "InsuranceQuote_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceQuote" ADD CONSTRAINT "InsuranceQuote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceQuote" ADD CONSTRAINT "InsuranceQuote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InsuranceProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceQuote" ADD CONSTRAINT "InsuranceQuote_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InsuranceProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "InsuranceQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDetail" ADD CONSTRAINT "InsuranceDetail_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceGuarantee" ADD CONSTRAINT "InsuranceGuarantee_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceStatusLog" ADD CONSTRAINT "InsuranceStatusLog_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceStatusLog" ADD CONSTRAINT "InsuranceStatusLog_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCancellation" ADD CONSTRAINT "InsuranceCancellation_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCancellation" ADD CONSTRAINT "InsuranceCancellation_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceParty" ADD CONSTRAINT "InsuranceParty_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceParty" ADD CONSTRAINT "InsuranceParty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceDocument" ADD CONSTRAINT "InsuranceDocument_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fleet" ADD CONSTRAINT "Fleet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
