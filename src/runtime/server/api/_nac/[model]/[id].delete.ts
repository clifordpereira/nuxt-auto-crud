import { eventHandler, getRouterParams } from "h3";

import { modelTableMap } from "../../../utils/modelMapper";
import { deleteRow } from "../../../utils/queries";
import { broadcast } from "../../../utils/sse-bus";

import { ResourceNotFoundError } from "../../../exceptions";

import type { TableWithId } from "../../../types";

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string; id: string };

  const table = modelTableMap[model] as TableWithId;
  if (!table) throw new ResourceNotFoundError(model);

  const deletedRecord = await deleteRow(table, id);

  await broadcast({
    table: model,
    action: "delete",
    primaryKey: deletedRecord.id as number | string,
    data: deletedRecord,
  });

  return deletedRecord;
}); 
