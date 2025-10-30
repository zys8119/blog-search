#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
const shPath = resolve(__dirname, "a.sh");
const mdPath = resolve(__dirname, "blog.md");
const aPath = resolve(__dirname, "a.js");
execSync(
  `
mdPath=${mdPath}
aPath=${aPath}
${readFileSync(shPath, "utf-8")}  
`,
  {
    stdio: "inherit",
  }
);
