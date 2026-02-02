import { eventHandler, getQuery, getHeader } from 'h3'
import { getTableForModel, getAvailableModels } from '../../utils/modelMapper'
import { getTableColumns as getDrizzleTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { getProtectedFields, getHiddenFields } from '../../utils/modelMapper'
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from 'hub:db'

export default eventHandler(async (event) => {

  const query = getQuery(event)
  const acceptHeader = getHeader(event, 'accept') || ''

  const models = getAvailableModels().length > 0
    ? getAvailableModels()
    : Object.keys(db?.query || {})

  const resources = models.map((model) => {
    try {
      const table = getTableForModel(model)
      const columns = getDrizzleTableColumns(table)
      const config = getTableConfig(table)

      const fields = Object.entries(columns)
        .filter(([name]) => !getHiddenFields(model).includes(name))
        .map(([name, col]) => {
          let references = null
          // @ts-expect-error - Drizzle foreign key internals
          const fk = config?.foreignKeys.find(f => f.reference().columns[0].name === col.name)

          if (fk) {
            // @ts-expect-error - Drizzle internals
            references = fk.reference().foreignTable[Symbol.for('drizzle:Name')]
          }
          // @ts-expect-error - Drizzle internal referenceConfig
          else if (col.referenceConfig?.foreignTable) {
            // @ts-expect-error - Drizzle internal referenceConfig
            const foreignTable = col.referenceConfig.foreignTable
            references = foreignTable[Symbol.for('drizzle:Name')] || foreignTable.name
          }

          const semanticType = col.columnType.toLowerCase().replace('sqlite', '')

          return {
            name,
            type: semanticType,
            required: col.notNull || false,
            isEnum: !!col.enumValues,
            options: col.enumValues || null,
            references,
            isRelation: !!references,
            // Agentic Hint: Is this field writable by the user/agent?
            isReadOnly: getProtectedFields().includes(name),
          }
        })

      const fieldNames = fields.map(f => f.name)
      const labelField = fieldNames.find(n => n === 'name')
        || fieldNames.find(n => n === 'title')
        || fieldNames.find(n => n === 'email')
        || 'id'

      return {
        resource: model,
        endpoint: `/api/${model}`,
        labelField,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        fields,
      }
    }
    catch {
      return null
    }
  }).filter(Boolean)

  const payload = {
    architecture: 'Clifland-NAC',
    version: '1.0.0-agentic',
    resources,
  }

  // --- CONTENT NEGOTIATION FOR AGENTIC TOOLS ---
  if (query.format === 'md' || acceptHeader.includes('text/markdown')) {
    let markdown = `# ${payload.architecture} API Manifest (v${payload.version})\n\n`

    payload.resources.forEach((res) => {
      if (!res) return
      markdown += `### Resource: ${res.resource}\n`
      markdown += `- **Endpoint**: \`${res.endpoint}\`\n`
      markdown += `- **Methods**: ${res.methods.join(', ')}\n`
      markdown += `- **Primary Label**: \`${res.labelField}\`\n\n`
      markdown += `| Field | Type | Required | Writable | Details |\n`
      markdown += `| :--- | :--- | :--- | :--- | :--- |\n`

      res.fields.forEach((f) => {
        const details = f.isEnum && f.options ? `Options: ${f.options.join(', ')}` : (f.references ? `Refs: ${f.references}` : '-')
        markdown += `| ${f.name} | ${f.type} | ${f.required ? '✅' : '❌'} | ${f.isReadOnly ? '❌' : '✅'} | ${details} |\n`
      })
      markdown += `\n---\n`
    })

    return markdown
  }

  return payload
})
