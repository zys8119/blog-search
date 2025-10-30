import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import unocss from "unocss/vite";
import dts from "vite-plugin-dts";
export default defineConfig({
  plugins: [
    unocss(),
    vue(),
    // dts({
    //   entryRoot: "src", // 类型声明入口目录
    //   outDir: "dist/types", // 输出到 dist/types
    //   cleanVueFileName: true, // 去掉 .vue 文件名中的 hash
    //   insertTypesEntry: true, // 生成 index.d.ts
    //   // tsCompiler: "vue-tsc",
    //   rollupTypes: true,
    //   // tsconfigPath: "./ts.config.json",
    // }),
    // Components({
    //   dts: "components.d.ts",
    //   include: [
    //     /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
    //     /\.vue$/,
    //     /\.md$/, // .md
    //   ],
    //   resolvers: [],
    //   extensions: ["vue", "md", "ts", "tsx"],
    // }),
    // AutoImport({
    //   include: [
    //     /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
    //     /\.vue$/,
    //     /\.vue\?vue/, // .vue
    //     /\.md$/, // .md
    //   ],
    //   imports: ["vue", "vue-router", "@vueuse/core"],
    //   dts: "auto-import.d.ts",
    //   resolvers: [],
    // }),
  ],
  base: "./",
  build: {
    target: "es2015",
    lib: {
      entry: {
        index: "./src/index.ts",
        a: "./src/a.ts",
      },
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["readline", "child_process", "fs", "path"],
    },
  },
});
