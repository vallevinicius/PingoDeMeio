-- AlterTable
ALTER TABLE `Order` ADD COLUMN `clientId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Order_clientId_idx` ON `Order`(`clientId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
