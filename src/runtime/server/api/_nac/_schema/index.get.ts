import { eventHandler } from 'h3'

import { getAllSchemas } from '../../../utils/schema'

export default eventHandler(async (event) => {
  return getAllSchemas()
})
