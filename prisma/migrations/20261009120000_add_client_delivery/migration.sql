-- AlterTable
ALTER TABLE `ClientPayout` ADD COLUMN `paymentMethod` ENUM('PIX', 'CARTAO', 'DINHEIRO') NULL;

-- CreateTable
CREATE TABLE `ClientDelivery` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `clientId` INT NOT NULL,
    `productId` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `note` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientDelivery` ADD CONSTRAINT `ClientDelivery_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientDelivery` ADD CONSTRAINT `ClientDelivery_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
