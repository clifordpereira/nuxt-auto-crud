import { eventHandler } from 'h3'

import { getRelations } from '../utils/schema'

export default eventHandler(async (event) => {
  return getRelations()
})
