function markdownToFlatTree(md) {
  const lines = md.split(/\r?\n/);
  const result = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      // 遇到新标题，先把上一个存入结果
      if (current) result.push(current);
      current = {
        title: `${heading[1]} ${heading[2].trim()}`,
        value: "",
      };
    } else {
      // 普通内容追加到当前标题
      if (current) {
        // 保留换行，便于格式化
        current.value += (current.value ? "\n" : "") + line;
      }
    }
  }

  // 最后一个标题也要推入
  if (current) result.push(current);
  return result;
}
const cmds: CMDS = {
  "--mdTitle": {
    message: "解析md大纲",
    async callback({ parames }) {
      const content = (await getParames(parames)) as string;
      const contentTree = markdownToFlatTree(content);
      console.log(contentTree.map((e) => e.title).join("\n"));
    },
  },
  "--md": {
    message: "解析Md",
    async callback({ parames }) {
      const content = (await getParames(parames)) as string;
      const contentTree = markdownToFlatTree(content);
      const data = contentTree.find((e) => {
        return parames[0] === e.title;
      });
      console.log(data?.value);
    },
  },
};
/**
 * 获取管道数据
 * @param parames
 * @returns
 */
const getParames = async (parames: string[] = []) => {
  if (process.stdin.isTTY) {
    return parames.join("");
  } else {
    return new Promise((r, err) => {
      // 管道模式
      process.stdin.setEncoding("utf8");
      let input = "";
      process.stdin.on("data", (chunk) => {
        input += chunk;
      });
      process.stdin.on("end", async () => {
        r(input || parames.join(""));
      });
      process.stdin.on("err", async (errMsg) => {
        err(errMsg);
      });
    });
  }
};
type CMDCALLBACKARGS = {
  help(): ReturnType<CMDCALLBACK>;
  parames: any[];
};
type CMDCALLBACK = (options: CMDCALLBACKARGS) => any | Promise<any>;
type CMD = Partial<{
  [key: string]: CMDS | string | CMDCALLBACK;
  message: string;
  callback: CMDCALLBACK;
}>;
type CMDS = Record<string, CMD>;
(async function run([cmd, ...parames], cmds: CMDS) {
  const initHelp = {
    message: "查看帮助",
    callback({ help }) {
      help();
    },
  };
  cmds = {
    ...cmds,
    "--help": initHelp,
    "-h": initHelp,
  };
  const keys = Object.keys(cmds).map((e) => e.trim());
  const currentCmd = keys.find((e) => e === cmd);
  const currentCmdInfo = cmds[currentCmd];
  const help = async (isHelp = false) => {
    if (!isHelp && currentCmdInfo) {
      return;
    } else {
      const max = keys.reduce((a: number, b: string) => {
        return a > b.length ? a : b.length;
      }, 0);
      const helpInfo = [[], []];
      keys.map((k) => {
        if (["message", "callback"].includes(k)) {
          return;
        }
        const message = cmds[k]?.message ?? "";
        const log = `${k.padEnd(max, " ")}${"----"
          .padStart(10, " ")
          .padEnd(14, " ")}${message}`.trim();
        if (k.trim().startsWith("-")) {
          helpInfo[1].push(log);
        } else {
          helpInfo[0].push(log);
        }
      });
      console.log(
        `
        命令帮助
        ${helpInfo[0].length > 0 ? `Command:` : ""}
          ${helpInfo[0].map((e) => `\\n${e}`).join("\n")}
        ${helpInfo[1].length > 0 ? `Options:` : ""}
          ${helpInfo[1].map((e) => `\\n${e}`).join("\n")}
      `
          .split("\n")
          .filter((e) => Boolean(e.trim()))
          .map((e) => {
            return e.trim().replace(/^\\n(?=\s*)/, "  ");
          })
          .join("\n")
      );
    }
  };
  if (currentCmdInfo) {
    const callback =
      typeof currentCmdInfo === "function"
        ? currentCmdInfo
        : typeof currentCmdInfo?.callback === "function"
        ? currentCmdInfo?.callback
        : null;
    if (callback) {
      return await callback({
        parames,
        help: async () => {
          await help(true);
        },
      });
    } else if (typeof currentCmdInfo === "object") {
      return await run(parames, currentCmdInfo || ({} as any));
    } else {
      return await help();
    }
  } else {
    return await help();
  }
})(process.argv.slice(2), cmds);
