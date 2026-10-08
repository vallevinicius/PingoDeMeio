import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'consignment_fee_per_unit'
const DEFAULT_FEE = 5

/**
 * Valor padrão sugerido ao cadastrar um novo cliente consignado (quanto o parceiro recebe por unidade).
 * Configurável em Configurações; cada cliente pode depois ajustar o seu próprio valor.
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

/** Se o cliente gera um saldo em aberto (consignado, sobre venda). Clientes da empresa e pagamento adiantado não geram. */
export function hasOpenBalance(client: Pick<ConsignmentClient, 'isCompany' | 'paymentType'>) {
  return !client.isCompany && client.paymentType === 'SOBRE_VENDA'
}

/**
 * Quanto é devido pelas unidades vendidas, pela direção do cliente:
 * REPASSAR = a empresa deve ao ponto de venda (usa partnerAmount);
 * RECEBER = o ponto de venda deve à empresa (usa companyAmount).
 */
export function consignmentBalance(quantity: number, client: ConsignmentClient) {
  if (!hasOpenBalance(client)) return 0
  const perUnit = client.direction === 'RECEBER' ? client.companyAmount : client.partnerAmount
  return quantity * perUnit
}
