import { defineConfig } from "unocss";
import less from "less";
const tint = (color: string, amount: number) =>
  (less as any).functions?.functionRegistry
    .get("tint")(
      new (less as any).color(color.replace(/#/, "")),
      new (less as any).dimension(amount, "%")
    )
    .toRGB();
export default defineConfig({
  // ...UnoCSS options
  shortcuts: {
    "flex-center": "flex justify-center items-center",
    "flex-center-start": "flex justify-start items-center",
    "flex-center-end": "flex justify-end items-center",
    "flex-center-between": "flex justify-between items-center",
    "flex-center-around": "flex justify-around items-center",
    "flex-v": "flex flex-col",
    "abs-f": "fixed",
    "abs-r": "relative",
    abs: "absolute",
    "size-content": "left-0 top-0 w-100% h-100%",
    "abs-content": "absolute left-0 top-0 w-100% h-100%",
    "abs-start": "absolute left-0 top-0",
    "abs-end": "absolute right-0 top-0",
    "abs-end-bottom": "absolute right-0 bottom-0",
    "abs-start-bottom": "absolute left-0 bottom-0",
    "abs-center": "absolute left-50% top-50% translate--50%",
    "abs-x": "absolute left-50% translate-x--50%",
    "abs-y": "absolute top-50% translate-y--50%",
    bold: "font-bold",
    "cur-p": "cursor-pointer",
    "p-e-n": "pointer-events-none",
  },
  rules: [
    [
      // 包含小数点的 flex
      /^flex-?([0-9]+(?:\.[0-9]+)?)$/,
      (match) => {
        return {
          flex: match[1],
        };
      },
    ],
    [
      /^tr-?([xy])(?:-?(-?.+))?$/,
      (match) => {
        return {
          transform: `translate${match[1].toUpperCase() || "Y"}(${
            match[2] || 0
          })`,
        };
      },
    ],
    [
      // c-var--primary-color => color: var(--primary-color)
      /^c-var-([a-zA-Z0-9-]+)$/,
      (match) => {
        return {
          color: `var(--${match[1]})`,
        };
      },
    ],
    [
      /^(s|size)-([a-zA-Z0-9-]+)$/,
      (match) => {
        return {
          width: match[2],
          height: match[2],
        };
      },
    ],
    [
      /^bg-tint-(.+)$/,
      ([, value]) => {
        return {
          background: `linear-gradient(to right, ${value},${tint(value, 50)})`,
        };
      },
    ],
    [
      /^bg-(lg|rlg|rg|rrg|url)-(.{1,})$/,
      (match) => {
        return {
          "background-image": `${
            {
              lg: "linear-gradient",
              rlg: "radial-gradient",
              rg: "repeating-linear-gradient",
              rrg: "repeating-radial-gradient",
              url: "url",
            }[match[1]]
          }(${match[2]
            .replace(/--/g, " , ")
            .replace(/-/g, " ")
            .replace(/\$([^\s]+)/g, "var(--$1)")})`,
        };
      },
    ],
    [
      /^u-?(text|bg|color|w)-?(.*)/,
      (m) => {
        return {
          text: `.${m[0]}{color:${m[2].replace("0x", "#")};}`,
          color: `.${m[0]}{color:${m[2].replace("0x", "#")};}`,
          bg: `.${m[0]}{background-color:${m[2].replace("0x", "#")};}`,
          w: `.${m[0]}{width:${m[2]}%;}`,
          h: `.${m[0]}{height:${m[2]}%;}`,
        }[m[1]];
      },
    ],
  ],
  variants: [
    (matcher) => {
      const m = matcher.match(/^(.{1,})-hover:(.{1,})$/);
      if (m) {
        return {
          matcher: m[2],
          selector: (s) => `.${m[1]}:hover ${s}`,
        };
      }
    },
    (matcher, { rawSelector }) => {
      const important = /^!|!$/.test(rawSelector) ? "!" : "";
      const importantStart = /^!/.test(rawSelector) ? important : "";
      const importantEnd = /!$/.test(rawSelector) ? important : "";
      const matcherReplace = (matcher) =>
        matcher.replace(/(\.|:|\[|\]|#|&|!|>|\+|~)/g, "\\$1");
      if (/^[^-]+-hover-self-/.test(matcher)) {
        const m = matcher.match(/^([^-]+)-hover-(self-.*)/);
        const mm = m[2].match(/^self-([^\:]+):((?=:*([^:]+):(.*))|(.*))/);
        return {
          matcher: `${mm[4] || mm[2]}`,
          selector: () => {
            return `.${matcherReplace(
              `${importantStart}${m[1] === "&" ? matcher : m[1]}${importantEnd}`
            )}:hover ${mm[3] ? `:${mm[3]}` : ""} ${
              m[1] === "&" ? "" : `.${matcherReplace(matcher)}`
            } ${mm[1]}`;
          },
        };
      }
      if (/^self/.test(matcher)) {
        const m = matcher.match(/^self-([^\:]+):((?=:*(.*):(.*))|(.*))/);
        if (m) {
          return {
            matcher: `${m[4] || m[2]}`,
            selector: () => {
              return `.${matcherReplace(
                `${importantStart}${matcher}${importantEnd}`
              )} ${m[1]}${m[3] ? `:${m[3]}` : ""}`;
            },
          };
        } else {
          const m = matcher.match(/^self(.*):((?=:*(.+)?:(.*))|(.*))/);
          return {
            matcher: `${m[4] || m[2]}`,
            selector: () => {
              return `.${matcherReplace(
                `${importantStart}${matcher}${importantEnd}`
              )} ${m[1]}${m[3] ? `:${m[3]}` : ""}`;
            },
          };
        }
      }
    },
  ],
});
