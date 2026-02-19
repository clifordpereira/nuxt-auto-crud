import { eventHandler } from 'h3'

import { modelTableMap } from '../../../utils/modelMapper'

export default eventHandler(async () => {
  return Object.keys(modelTableMap)
})
