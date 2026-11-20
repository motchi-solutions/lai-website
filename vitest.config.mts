import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Vendored agent skills ship their own test helpers; they are not app tests.
        exclude: [...configDefaults.exclude, ".agents/**"],
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
