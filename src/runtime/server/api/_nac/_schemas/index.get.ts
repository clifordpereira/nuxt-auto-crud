import { eventHandler } from 'h3'

import { nacModelTableMap } from '../../../utils/modelMapper'

export default eventHandler(async () => {
  return Object.keys(nacModelTableMap)
})
