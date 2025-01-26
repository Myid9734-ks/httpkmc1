-- CreateTable
CREATE TABLE "EquipmentInspection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inspection_id" INTEGER NOT NULL,
    "level1_id" INTEGER,
    "level2_id" INTEGER,
    "level3_id" INTEGER,
    "level4_id" INTEGER,
    "line_name" TEXT NOT NULL,
    "inspection_name" TEXT NOT NULL,
    "inspection_standard" TEXT NOT NULL,
    "inspection_cycle" TEXT NOT NULL,
    "scheduled_date" DATETIME NOT NULL,
    "execution_due_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
