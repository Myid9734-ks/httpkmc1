-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_maintenances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serial_no" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "inspector" TEXT NOT NULL,
    "factory" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'register',
    "is_other" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_date" DATETIME NOT NULL,
    "completed_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_maintenances" ("completed_date", "created_at", "department", "description", "factory", "id", "inspector", "line", "photos", "scheduled_date", "serial_no", "status", "title", "updated_at") SELECT "completed_date", "created_at", "department", "description", "factory", "id", "inspector", "line", "photos", "scheduled_date", "serial_no", "status", "title", "updated_at" FROM "maintenances";
DROP TABLE "maintenances";
ALTER TABLE "new_maintenances" RENAME TO "maintenances";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
