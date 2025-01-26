-- CreateTable
CREATE TABLE "quick_inspections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inspection_name" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "weekdays" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
