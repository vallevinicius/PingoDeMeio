'use client'

type Props = {
  value: string
  onChange: (value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CurrencyInput({ value, onChange, ...props }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = digits ? parseInt(digits, 10) : 0
    onChange((cents / 100).toFixed(2))
  }

  const display = value === '' ? '' : centsToBRL(Math.round(Number(value) * 100))

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={props.placeholder ?? 'R$ 0,00'}
    />
  )
}
