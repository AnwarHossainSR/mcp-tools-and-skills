import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  tsconfig: "./tsconfig.build.json",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  // zod is core's only dependency — keep it external, never inline it.
  deps: { neverBundle: ["zod"] },
});
