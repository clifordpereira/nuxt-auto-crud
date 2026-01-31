// server/api/[model]/index.post.ts
import { eventHandler, getRouterParams, readBody } from "h3";
import type { H3Event } from "h3";
import {
  getTableForModel,
  getZodSchema,
  formatResourceResult,
} from "../../utils/modelMapper";
// @ts-expect-error - 'hub:db' is a virtual alias
import { db } from "hub:db";
import { ensureResourceAccess } from "../../utils/guard";
import { broadcast } from "../../utils/sse-bus";

export default eventHandler(async (event) => {
  const { model } = getRouterParams(event) as { model: string };
  await ensureResourceAccess(event, model, "create");

  const table = getTableForModel(model);

  const body = await readBody(event);
  const schema = getZodSchema(model, "insert");
  const payload = await schema.parseAsync(body);

  const newRecord = (await db
    .insert(table)
    .values(payload)
    .returning()
    .get()) as Record<string, unknown>;

  broadcast({
    table: model,
    action: "create",
    primaryKey: newRecord.id,
    data: newRecord,
  });

  const isGuest = event.context.isGuest ?? false;

  return formatResourceResult(model, newRecord, isGuest);
});
