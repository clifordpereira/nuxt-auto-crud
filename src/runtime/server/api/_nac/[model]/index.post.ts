// server/api/_nac/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from "h3";
import { getTableForModel, getZodSchema, formatResourceResult, filterUpdatableFields } from "../../../utils/modelMapper";
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from "hub:db";
import { broadcast } from "../../../utils/sse-bus";

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string };

  const table = getTableForModel(model);

  const body = await readBody(event);
  const sanitizedBody = filterUpdatableFields(model, body);
  const schema = getZodSchema(model, "insert");
  const payload = await schema.parseAsync(sanitizedBody);

  const newRecord = (await db
    .insert(table)
    .values(payload)
    .returning()
    .get()) as Record<string, unknown>;

  const sanitizedData = formatResourceResult(model, newRecord)

  broadcast({
    table: model,
    action: "create",
    primaryKey: newRecord.id,
    data: sanitizedData,
  });

  return sanitizedData
});
