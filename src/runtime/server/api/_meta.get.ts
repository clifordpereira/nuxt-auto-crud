import { eventHandler, getQuery, getHeader } from 'h3'
import { getTableForModel, getAvailableModels } from '../utils/modelMapper'
import { getTableColumns as getDrizzleTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { PROTECTED_FIELDS, HIDDEN_FIELDS } from '../utils/constants'
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from 'hub:db'
import { ensureAuthenticated } from '../utils/auth'

export default eventHandler(async (event) => {
  await ensureAuthenticated(event)

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
        .filter(([name]) => !HIDDEN_FIELDS.includes(name))
        .map(([name, col]) => {
          let references = null
          const fk = config?.foreignKeys.find((f: any) =>
            f.reference().columns[0].name === col.name,
          )

          if (fk) {
            // @ts-expect-error - Drizzle internals
            references = fk.reference().foreignTable[Symbol.for('drizzle:Name')]
          }
          else if ((col as any).referenceConfig?.foreignTable) {
            const foreignTable = (col as any).referenceConfig.foreignTable
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
            isReadOnly: PROTECTED_FIELDS.includes(name),
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

  const currentToken = getQuery(event).token || (getHeader(event, 'authorization')?.split(' ')[1])
  const tokenSuffix = currentToken ? `?token=${currentToken}` : ''

  // --- CONTENT NEGOTIATION FOR AGENTIC TOOLS ---
  if (query.format === 'md' || acceptHeader.includes('text/markdown')) {
    let markdown = `# ${payload.architecture} API Manifest (v${payload.version})\n\n`
    
    payload.resources.forEach((res: any) => {
      markdown += `### Resource: ${res.resource}\n`
      markdown += `- **Endpoint**: \`${res.endpoint}${tokenSuffix}\`\n`
      markdown += `- **Methods**: ${res.methods.join(', ')}\n`
      markdown += `- **Primary Label**: \`${res.labelField}\`\n\n`
      markdown += `| Field | Type | Required | Writable | Details |\n`
      markdown += `| :--- | :--- | :--- | :--- | :--- |\n`
      
      res.fields.forEach((f: any) => {
        const details = f.isEnum ? `Options: ${f.options.join(', ')}` : (f.references ? `Refs: ${f.references}` : '-')
        markdown += `| ${f.name} | ${f.type} | ${f.required ? '✅' : '❌'} | ${f.isReadOnly ? '❌' : '✅'} | ${details} |\n`
      })
      markdown += `\n---\n`
    })
    
    return markdown
  }

  return payload
})