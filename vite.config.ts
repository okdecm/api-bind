import path from "path";
import { defineConfig } from "vite";

import typescript from "@rollup/plugin-typescript";

export default defineConfig({
	build: {
		manifest: true,
		minify: true,
		reportCompressedSize: true,
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			fileName: "index",
			name: "APIBind",
			formats: [
				"es",
				"cjs",
				"umd"
			]
		},
		rollupOptions: {
			plugins: [
				typescript({
					sourceMap: true,
					declaration: true,
					outDir: "dist",
				})
			]
		}
	}
});
