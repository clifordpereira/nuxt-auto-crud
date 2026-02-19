export interface Field {
  name: string
  type: string
  required?: boolean
  selectOptions?: string[]
  references?: string
  isReadOnly?: boolean
}

export interface SchemaDefinition {
  resource: string
  labelField: string
  fields: Field[]
}
