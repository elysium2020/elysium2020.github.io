#!/usr/bin/env python3

import re
from datetime import date
from pathlib import Path

POST_DIR = Path.cwd() / "src" / "content" / "posts"


def solve_filename(name: str) -> str:
    return f"{
        re.sub(
            r'_{2,}',
            '',
            re.sub(r'[^a-z0-9_\-.]', '', re.sub(r'\s+', '_', name.lower())),
        ).strip('_')
    }.md"


def generate_frontmatter(title: str, qnum: int | None, artype: str) -> str:
    frontmatter = {
        "title": title,
        "pubDate": date.today().strftime("%Y-%m-%d"),
        "description": f"LeetCode {qnum} 题解析" if artype == "LeetCode 题解" else "",
        "tags": ["leetcode"] if artype == "LeetCode 题解" else [""],
    }

    yaml_lines = ["---"]

    for k, v in frontmatter.items():
        if isinstance(v, list):
            yaml_lines.append(f"{k}: {repr(v)}")
        elif k in ("title", "description"):
            assert isinstance(v, str), f"Expected string for {k}, got {type(v)}"
            yaml_lines.append(f"{k}: '{v.replace("'", "''")}'")
        else:
            yaml_lines.append(f"{k}: {v}")

    yaml_lines.extend(["---", ""])
    return "\n".join(yaml_lines)


def create_post() -> None:
    choices = ("普通帖子", "LeetCode 题解")

    print("选择要创建的文档类型：")
    for i, choice in enumerate(choices, 1):
        print(f"{i}. {choice}")

    while True:
        choice_input = input(f"请输入选项 (1-{len(choices)}), 回车取消: ").strip()
        if not choice_input:
            print("操作已取消。")
            return
        if choice_input.isdigit() and (choice_idx := int(choice_input)) in range(
            1, len(choices) + 1
        ):
            template_type = choices[choice_idx - 1]
            break
        print(f"无效输入，请输入 1-{len(choices)} 的数字")

    while not (cur_title := input("请输入文档标题：").strip()):
        print("错误：输入不能为空！")

    problem_num = None
    if template_type == "LeetCode 题解":
        while True:
            num_input = input("请输入题目编号：").strip()
            if not num_input:
                print("操作已取消。")
                return
            if num_input.isdigit():
                problem_num = int(num_input)
                break
            print("错误：题号必须是数字")

    file_name = solve_filename(cur_title)
    file_path = POST_DIR / file_name
    if file_path.exists():
        print(f"文件已存在: {file_path}")
        return

    try:
        content = generate_frontmatter(cur_title, problem_num, template_type)
        if template_type == "LeetCode 题解":
            content += "\n## 分析\n\n## 解答"

        _ = file_path.write_text(content, encoding="utf-8")
        print(f"文件创建成功: {file_path}")
    except (OSError, ValueError) as e:
        err_type = "配置错误" if isinstance(e, ValueError) else "写入错误"
        print(f"{err_type}: {e}")


if __name__ == "__main__":
    create_post()
