-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deadline" TEXT,
    "relatedTo" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deadline_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deadline" ("createdAt", "deadline", "id", "meetingId", "relatedTo", "updatedAt") SELECT "createdAt", "deadline", "id", "meetingId", "relatedTo", "updatedAt" FROM "Deadline";
DROP TABLE "Deadline";
ALTER TABLE "new_Deadline" RENAME TO "Deadline";
CREATE TABLE "new_FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followUp" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TEXT,
    "meetingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUp_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FollowUp" ("createdAt", "dueDate", "followUp", "id", "meetingId", "owner", "updatedAt") SELECT "createdAt", "dueDate", "followUp", "id", "meetingId", "owner", "updatedAt" FROM "FollowUp";
DROP TABLE "FollowUp";
ALTER TABLE "new_FollowUp" RENAME TO "FollowUp";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
