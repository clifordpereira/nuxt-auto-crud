import { defineNitroPlugin } from 'nitropack/runtime'
import { nacValidateFieldConfig } from '../utils/validate-config'

export default defineNitroPlugin(() => {
  nacValidateFieldConfig()
})
