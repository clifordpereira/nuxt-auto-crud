// composables/useFormState.ts
export function useFormState(
  fields: { name: string, type: string, required?: boolean }[],
  initialState?: Record<string, unknown>,
) {
  const state = reactive<Record<string, unknown>>({})

  fields.forEach((field) => {
    let value = initialState?.[field.name] ?? ''

    if (field.type === 'date' && value) {
      const date = new Date(value as string | number | Date)

      // Convert to local datetime format suitable for <input type="datetime-local">
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      value = local
    }

    state[field.name] = value
  })

  return state
}
