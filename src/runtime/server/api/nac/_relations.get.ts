import { eventHandler } from "h3";

import { getRelations } from "../../utils/modelMapper";

export default eventHandler(async (event) => {
  return getRelations();
});
