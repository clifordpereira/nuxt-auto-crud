import { eventHandler } from 'h3'

import { getRelations } from '../utils/schema'
import { ensureAuthenticated } from '../utils/auth'

export default eventHandler(async (event) => {
  await ensureAuthenticated(event)
  return getRelations()
})
