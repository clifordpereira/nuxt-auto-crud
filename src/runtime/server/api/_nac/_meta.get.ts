import { nacDb as db } from '#nac/db'
import { eventHandler, getQuery, getHeader, setResponseHeader } from 'h3'
import { useRuntimeConfig } from '#imports'

import { nacGetSchemaDefinition, nacModelTableMap } from '../../utils/modelMapper'
import type { NacSchemaDefinition, NacField } from '../../../shared/utils/types'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { apiBase } = config.public.autoCrud

  const query = getQuery(event)
  const acceptHeader = getHeader(event, 'accept') || ''

  const availableModels = Object.keys(nacModelTableMap)
  const models = availableModels.length > 0
    ? availableModels
    : Object.keys(db?.query || {})

  const resourcesResults = await Promise.all(models.map(async (model) => {
    try {
      const schema: NacSchemaDefinition = await nacGetSchemaDefinition(model)
      const fields = schema.fields.map((field: NacField) => ({
        name: field.name,
        type: field.type,
        required: field.required,
        isEnum: !!field.selectOptions,
        options: field.selectOptions || null,
        references: field.references || null,
        isRelation: !!field.references,
        readonly: field.readonly || false,
      }))

      return {
        resource: model,
        endpoint: `${apiBase}/${model}`,
        labelField: schema.labelField,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        fields,
      }
    }
    catch {
      return null
    }
  }))

  const resources = resourcesResults.filter((res): res is NonNullable<typeof res> => res !== null)

  const payload = {
    architecture: 'Clifland-NAC',
    version: '1.0.0-agentic',
    resources,
  }

  // --- CONTENT NEGOTIATION FOR AGENTIC TOOLS ---
  if (query.format === 'md' || acceptHeader.includes('text/markdown')) {
    setResponseHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
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
        markdown += `| ${f.name} | ${f.type} | ${f.required ? '✅' : '❌'} | ${f.readonly ? '❌' : '✅'} | ${details} |\n`
      })
      markdown += `\n---\n`
    })

    return markdown
  }

  return payload
})
