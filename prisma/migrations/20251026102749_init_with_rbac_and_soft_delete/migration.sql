-- CreateEnum
CREATE TYPE "TruckStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE_SERVICE', 'OIL_CHANGE', 'TIRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'TANK_CLEANING', 'INSPECTION', 'EMERGENCY_REPAIR', 'OTHER');

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "street" VARCHAR(500),
    "city" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255),
    "region" VARCHAR(255),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100) DEFAULT 'Turkmenistan',
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "fathername" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(25) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "birthdate" TIMESTAMP(3),
    "email" VARCHAR(255),
    "work_email" VARCHAR(255),
    "work_phone" VARCHAR(25),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "refresh_token" TEXT,
    "token_expiry" TIMESTAMP(3),
    "passport_number" VARCHAR(25),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "role_id" INTEGER NOT NULL,
    "position" VARCHAR(255),
    "department" VARCHAR(255),
    "hire_date" TIMESTAMP(3),
    "office_id" INTEGER,
    "branch_id" INTEGER,
    "created_by_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" INTEGER,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "address_id" INTEGER NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "office_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "engine_number" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100),
    "make" VARCHAR(100),
    "plate_number" VARCHAR(50) NOT NULL,
    "registration_number" VARCHAR(50) NOT NULL,
    "year" INTEGER,
    "color" VARCHAR(50),
    "capacity" DECIMAL(10,2) NOT NULL,
    "capacity_unit" VARCHAR(20) NOT NULL DEFAULT 'm3',
    "registration_date" TIMESTAMP(3),
    "registration_expiry" TIMESTAMP(3),
    "insurance_expiry" TIMESTAMP(3),
    "last_maintenance_date" TIMESTAMP(3),
    "maintenance_type" "MaintenanceType",
    "maintenance_description" TEXT,
    "maintenance_service_provider" VARCHAR(255),
    "maintenance_completed_date" TIMESTAMP(3),
    "next_maintenance_date" TIMESTAMP(3),
    "status" "TruckStatus" NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "office_id" INTEGER,
    "branch_id" INTEGER,

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_places" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "place_name" VARCHAR(255) NOT NULL,
    "receiver_name" VARCHAR(255) NOT NULL,
    "receiver_phone" VARCHAR(25),
    "address_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "delivery_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "delivery_number" VARCHAR(50) NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "scheduled_time" VARCHAR(10),
    "actual_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "quantity" DECIMAL(10,2),
    "quantity_unit" VARCHAR(20) DEFAULT 'm3',
    "price_per_unit" DECIMAL(12,2),
    "total_amount" DECIMAL(12,2),
    "transport_fee" DECIMAL(12,2),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "distance_traveled" DECIMAL(10,2),
    "driver_name" VARCHAR(255),
    "notes" TEXT,
    "cancellation_reason" TEXT,
    "delivery_place_id" INTEGER NOT NULL,
    "truck_id" INTEGER NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_city_idx" ON "addresses"("city");

-- CreateIndex
CREATE INDEX "addresses_latitude_longitude_idx" ON "addresses"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_work_email_key" ON "users"("work_email");

-- CreateIndex
CREATE UNIQUE INDEX "users_passport_number_key" ON "users"("passport_number");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_office_id_idx" ON "users"("office_id");

-- CreateIndex
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_active_idx" ON "roles"("active");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_module_idx" ON "activity_logs"("module");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "offices_name_key" ON "offices"("name");

-- CreateIndex
CREATE UNIQUE INDEX "offices_code_key" ON "offices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "offices_address_id_key" ON "offices"("address_id");

-- CreateIndex
CREATE INDEX "offices_active_idx" ON "offices"("active");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_address_id_key" ON "branches"("address_id");

-- CreateIndex
CREATE INDEX "branches_office_id_idx" ON "branches"("office_id");

-- CreateIndex
CREATE INDEX "branches_active_idx" ON "branches"("active");

-- CreateIndex
CREATE UNIQUE INDEX "trucks_engine_number_key" ON "trucks"("engine_number");

-- CreateIndex
CREATE UNIQUE INDEX "trucks_plate_number_key" ON "trucks"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "trucks_registration_number_key" ON "trucks"("registration_number");

-- CreateIndex
CREATE INDEX "trucks_office_id_idx" ON "trucks"("office_id");

-- CreateIndex
CREATE INDEX "trucks_branch_id_idx" ON "trucks"("branch_id");

-- CreateIndex
CREATE INDEX "trucks_status_idx" ON "trucks"("status");

-- CreateIndex
CREATE INDEX "trucks_active_idx" ON "trucks"("active");

-- CreateIndex
CREATE INDEX "delivery_places_active_idx" ON "delivery_places"("active");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_delivery_number_key" ON "deliveries"("delivery_number");

-- CreateIndex
CREATE INDEX "deliveries_delivery_place_id_idx" ON "deliveries"("delivery_place_id");

-- CreateIndex
CREATE INDEX "deliveries_truck_id_idx" ON "deliveries"("truck_id");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "deliveries_scheduled_date_idx" ON "deliveries"("scheduled_date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_places" ADD CONSTRAINT "delivery_places_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_delivery_place_id_fkey" FOREIGN KEY ("delivery_place_id") REFERENCES "delivery_places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
