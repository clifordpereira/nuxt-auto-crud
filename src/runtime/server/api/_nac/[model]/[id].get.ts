// server/api/_nac/[model]/[id].get.ts
import { eventHandler, getRouterParams } from "h3";
import {
  getTableForModel,
  formatResourceResult,
} from "../../../utils/modelMapper";
import type { TableWithId } from "../../../types";
import { getRecord } from "../../../utils/queries";
import { RecordNotFoundError } from "../../../exceptions";

export default eventHandler(async (event) => {
  const { model, id } = getRouterParams(event) as { model: string; id: string };

  const table = getTableForModel(model) as TableWithId;

  const record = await getRecord(table, id, { record: event.context.nacRecord });
  if (!record) throw new RecordNotFoundError();

  return formatResourceResult(model, record);
});
