import { useRuntimeConfig } from '#imports'
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from 'hub:db'
import { eventHandler, getQuery, getHeader } from 'h3'

import { getSchemaDefinition, modelTableMap } from '../../utils/modelMapper'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()
  const endpointPrefix = config.public.autoCrud.endpointPrefix

  const query = getQuery(event)
  const acceptHeader = getHeader(event, 'accept') || ''

  const availableModels = Object.keys(modelTableMap)
  const models = availableModels.length > 0
    ? availableModels
    : Object.keys(db?.query || {})

  const resources = models.map((model) => {
    try {
      const schema = getSchemaDefinition(model)

      // Transform SchemaDefinition to legacy API format
      const fields = schema.fields.map((field) => ({
        name: field.name,
        type: field.type,
        required: field.required,
        isEnum: !!field.selectOptions,
        options: field.selectOptions || null,
        references: field.references || null,
        isRelation: !!field.references,
        isReadOnly: field.isReadOnly || false,
      }))

      return {
        resource: model,
        endpoint: `${endpointPrefix}/${model}`,
        labelField: schema.labelField,
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
