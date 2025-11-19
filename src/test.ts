import { readFileSync } from "fs";
import markdownIt from "markdown-it";
import { get } from "lodash";
export const ForEach = <T>(
  options: Array<T>,
  callbackfn: (
    value: T,
    index: number,
    ParentDeep: Array<T>,
    array: T[],
    key: string
  ) => void,
  childrenPathName?: string,
  thisArg?: any,
  ParentDeep: Array<T> = [],
  key?: string
) => {
  if (Object.prototype.toString.call(options) === "[object Array]") {
    options.forEach((item, index, array) => {
      if (Object.prototype.toString.call(callbackfn) === "[object Function]") {
        callbackfn.call(
          thisArg,
          item,
          index,
          ParentDeep,
          array,
          `${key ? `${key}-` : ""}${index}`
        );
      }
      const children: any =
        Object.prototype.toString.call(item) === "[object Object]"
          ? get(item, childrenPathName || "children", [])
          : [];
      ForEach(
        children,
        callbackfn,
        childrenPathName,
        thisArg,
        ParentDeep.concat(item),
        `${key ? `${key}-` : ""}${index}`
      );
    });
  }
};
export function tokensToTree(tokens) {
  const root = { level: 0, children: [] };
  const stack = [root];

  let currentHeading = null;

  const tagToLevel = {
    h1: 1,
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // ① 捕获 heading_open：开始一个标题
    if (t.type === "heading_open") {
      const level = tagToLevel[t.tag];
      const heading = {
        ...t,
        type: "heading",
        level,
        content: "",
        children: [],
      };
      currentHeading = heading;
      continue;
    }

    // ② 捕获 inline（标题文本）
    if (t.type === "inline" && currentHeading) {
      currentHeading.content = t.content;
      continue;
    }

    // ③ heading_close：结束标题 → 把标题放入树
    if (t.type === "heading_close" && currentHeading) {
      const level = currentHeading.level;

      // 栈弹到正确父节点
      while (stack.length && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      // 追加到父节点
      stack[stack.length - 1].children.push(currentHeading);

      // 标题入栈
      stack.push(currentHeading);

      // 重置
      currentHeading = null;
      continue;
    }

    // ④ 普通内容 token → 挂在当前最近标题下
    const parent = stack[stack.length - 1];
    parent.children.push(t);
  }

  return root.children;
}
export function markdownToFlatTree(content: string) {
  const md = markdownIt();
  const tokens = md.parse(content, {});
  const tokensTree = tokensToTree(tokens);
  const tokensTreeMap = [];
  ForEach(tokensTree, (item: any, index, deep, arr, key) => {
    tokensTreeMap.push({
      title: item.content,
      value: ((items, res = "") => {
        ForEach(items, (it: any) => {
          res += `${it.content || ""}\n`;
        });
        return res;
      })(item.children || []),
    });
  });
  const result = tokensTreeMap.filter((e) => e.value);
  return result;
}
export default markdownToFlatTree;
