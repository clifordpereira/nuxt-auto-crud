import { eventHandler, getRouterParams } from "h3";

import { modelTableMap } from "../../../utils/modelMapper";
import { getRow } from "../../../utils/queries";

import { ResourceNotFoundError, MissingSlugError } from "../../../exceptions";

import type { TableWithId } from "../../../types";

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string; id: string };
  if (!model) throw ResourceNotFoundError
  if (!id) throw MissingSlugError

  const table = modelTableMap[model] as TableWithId;
  if (!table) throw new ResourceNotFoundError(model);

  return await getRow(table, id, event.context.nac || {});
});
