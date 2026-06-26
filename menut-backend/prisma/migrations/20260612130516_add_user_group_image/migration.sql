-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT;
