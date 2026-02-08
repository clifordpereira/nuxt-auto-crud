// server/api/_nac/[model]/[id].delete.ts
import { eventHandler, getRouterParams } from "h3";
import { getTableForModel, formatResourceResult } from "../../../utils/modelMapper";
import type { TableWithId } from "../../../types";
import { deleteRecord } from "../../../utils/queries";
import { RecordNotFoundError } from "../../../exceptions";
import { broadcast } from "../../../utils/sse-bus";

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string; id: string };

  const table = getTableForModel(model) as TableWithId;

  const deletedRecord = await deleteRecord(table, id, { record: event.context.nacRecord });
  if (!deletedRecord) throw new RecordNotFoundError();

  const sanitizedData = formatResourceResult(model, deletedRecord);

  await broadcast({
    table: model,
    action: "delete",
    primaryKey: deletedRecord.id,
    data: sanitizedData,
  });

  return sanitizedData;
});
