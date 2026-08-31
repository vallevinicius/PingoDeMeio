'use client'

type RecipeRow = { ingredientId: number; quantity: string }
type Ingredient = { id: number; name: string; unit: string }

export function RecipeEditor({ ingredients, rows, onChange }: {
  ingredients: Ingredient[]
  rows: RecipeRow[]
  onChange: (rows: RecipeRow[]) => void
}) {
  function updateRow(index: number, patch: Partial<RecipeRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function addRow() {
    const used = new Set(rows.map((r) => r.ingredientId))
    const next = ingredients.find((i) => !used.has(i.id))
    if (!next) return
    onChange([...rows, { ingredientId: next.id, quantity: '' }])
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div>
      {rows.map((row, i) => {
        const ingredient = ingredients.find((ing) => ing.id === row.ingredientId)
        return (
          <div key={i} className="inline-form" style={{ marginTop: i === 0 ? 0 : 8 }}>
            <div className="field-group" style={{ margin: 0 }}>
              <select value={row.ingredientId} onChange={(e) => updateRow(i, { ingredientId: Number(e.target.value) })}>
                {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
              </select>
            </div>
            <div className="field-group" style={{ margin: 0 }}>
              <input
                type="number"
                step="0.001"
                placeholder={`qtd. em ${ingredient?.unit ?? ''}`}
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: e.target.value })}
                style={{ width: 120 }}
              />
            </div>
            <button type="button" className="submit-btn" style={{ width: 'auto', padding: '10px 14px', background: '#b2465a' }} onClick={() => removeRow(i)}>
              Remover
            </button>
          </div>
        )
      })}
      <button type="button" className="link-button" style={{ marginTop: 10 }} onClick={addRow} disabled={rows.length >= ingredients.length}>
        + Adicionar ingrediente à receita
      </button>
    </div>
  )
}
