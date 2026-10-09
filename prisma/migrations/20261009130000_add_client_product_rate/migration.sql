-- CreateTable
CREATE TABLE `ClientProductRate` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `clientId` INT NOT NULL,
    `productId` INT NOT NULL,
    `siteSalePrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `companyAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `partnerAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ClientProductRate_clientId_productId_key`(`clientId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientProductRate` ADD CONSTRAINT `ClientProductRate_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientProductRate` ADD CONSTRAINT `ClientProductRate_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
