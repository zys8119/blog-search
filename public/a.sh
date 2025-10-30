#!/bin/bash

# 下载 blog.md（如果不存在）
if [[ ! -f '$mdPath' ]]; then
    curl -o $mdPath https://raw.githubusercontent.com/zys8119/Blog/refs/heads/master/README.md
fi;

title=$(cat $mdPath | node $aPath --mdTitle | fzf --preview "cat $mdPath | node $aPath --md {}")

echo $title

mdValue=$(cat $mdPath | node $aPath --md "$title")

echo "$mdValue"

success(){
    echo "✅ 内容已复制到剪切板"
}

# 复制到剪贴板（跨平台）
if command -v pbcopy >/dev/null; then
  echo "$mdValue" | pbcopy
  success
elif command -v xclip >/dev/null; then
  echo "$mdValue" | xclip -selection clipboard
  success
elif command -v xsel >/dev/null; then
  echo "$mdValue" | xsel --clipboard
  success
elif command -v clip >/dev/null; then
  echo "$mdValue" | clip
  success
else
  echo "⚠️ 未检测到剪贴板工具"
fi