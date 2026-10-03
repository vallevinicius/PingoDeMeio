import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'consignment_fee_per_unit'
const DEFAULT_FEE = 5

/** Comissão que repassamos a cada ponto de venda consignado, por açaí vendido. Configurável em Configurações. */
export async function getConsignmentFee() {
  const setting = await prisma.setting.findUnique({ where: { key: SETTING_KEY } })
  const value = setting ? Number(setting.value) : NaN
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_FEE
}

export async function setConsignmentFee(value: number) {
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value: String(value) },
    update: { value: String(value) },
  })
}

/** Quanto devemos repassar a um cliente pelas unidades vendidas. Clientes da empresa não geram repasse. */
export function consignmentPayout(quantity: number, isCompany: boolean, feePerUnit: number) {
  return isCompany ? 0 : quantity * feePerUnit
}
