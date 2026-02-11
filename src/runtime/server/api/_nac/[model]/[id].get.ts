// server/api/_nac/[model]/[id].get.ts
import { eventHandler, getRouterParams } from "h3";
import { modelTableMap } from "../../../utils/modelMapper";
import type { TableWithId } from "../../../types";
import { getRow } from "../../../utils/queries";
import { ResourceNotFoundError } from "../../../exceptions";

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string; id: string };

  const table = modelTableMap[model] as TableWithId;
  if (!table) throw new ResourceNotFoundError(model);

  return await getRow(table, id, event.context.nac || {});
});
