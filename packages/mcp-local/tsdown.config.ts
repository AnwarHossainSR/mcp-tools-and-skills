import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  tsconfig: "./tsconfig.build.json",
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  // Keep every runtime dependency external — bundle only this package's code.
  deps: { neverBundle: ["@anwarhossainsr/sendkit-core", "@modelcontextprotocol/sdk", "zod"] },
});
