import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'consignment_fee_per_unit'
const DEFAULT_FEE = 5

/**
 * Valor padrão sugerido ao cadastrar um novo cliente consignado (quanto o parceiro recebe por unidade).
 * Configurável em Configurações; cada cliente pode depois ajustar o seu próprio valor por sabor.
 */
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

type ConsignmentClient = {
  isCompany: boolean
  paymentType: 'SOBRE_VENDA' | 'ADIANTADO'
  direction: 'REPASSAR' | 'RECEBER'
  companyAmount: number
  partnerAmount: number
}

type ProductRate = { companyAmount: number; partnerAmount: number }

/** Se o cliente gera um saldo em aberto (consignado, sobre venda). Clientes da empresa e pagamento adiantado não geram. */
export function hasOpenBalance(client: Pick<ConsignmentClient, 'isCompany' | 'paymentType'>) {
  return !client.isCompany && client.paymentType === 'SOBRE_VENDA'
}

/**
 * Quanto é devido pelas unidades vendidas, somando sabor por sabor (cada um pode ter um valor diferente,
 * configurado em "Preços por sabor"; quando o sabor não tem valor próprio, usa o padrão do cliente).
 * REPASSAR = a empresa deve ao ponto de venda (usa partnerAmount); RECEBER = o ponto de venda deve à empresa (usa companyAmount).
 */
export function consignmentBalance(
  entries: { productId: number; quantity: number }[],
  client: ConsignmentClient,
  productRates: Map<number, ProductRate> = new Map(),
) {
  if (!hasOpenBalance(client)) return 0
  return entries.reduce((sum, entry) => {
    const rate = productRates.get(entry.productId)
    const perUnit = client.direction === 'RECEBER'
      ? (rate?.companyAmount ?? client.companyAmount)
      : (rate?.partnerAmount ?? client.partnerAmount)
    return sum + perUnit * entry.quantity
  }, 0)
}
