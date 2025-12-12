import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import '@iconify/utils';
import 'consola';

const manifest_get = defineEventHandler(async () => {
  const filePath = join(process.cwd(), "public", "data", "manifest.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
});

export { manifest_get as default };
//# sourceMappingURL=manifest.get.mjs.map
