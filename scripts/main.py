#!/usr/bin/env python3

import re
from datetime import date
from pathlib import Path

POST_DIR = Path.cwd().joinpath("src").joinpath("content").joinpath("posts")


def solve_filename(name: str) -> str:
    return f"{
        re.sub(
            r'_{2,}',
            '',
            re.sub(
                r'[^a-z0-9_\-.]', '', re.sub(r'\s+', '_', name.lower()).strip('_')
            ).strip(),
        )
    }.md"


def generate_frontmatter(title: str, qnum: int | None, artype: str) -> str:
    frontmatter = {
        "title": title,
        "pubDate": date.today().strftime("%Y-%m-%d"),
        "description": "",
        "tags": [""],
    }

    if artype == "LeetCode 题解":
        if qnum is None:
            raise ValueError("LeetCode 模板必须提供题号 (qnum).")
        frontmatter["description"] = f"LeetCode {qnum} 题解析"
        frontmatter["tags"] = ["leetcode"]

    yaml_lines = ["---"]

    for k, v in frontmatter.items():
        if isinstance(v, list):
            yaml_lines.append(f"{k}: {repr(v)}")
        elif k in ["title", "description"]:
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
        choice_idx_str = input(
            f"请输入选项编号 (1-{len(choices)}), 或直接回车取消: "
        ).strip()

        if not choice_idx_str:
            print("操作已取消 (未选择模板类型)。")
            return

        try:
            choice_idx = int(choice_idx_str) - 1
            if 0 <= choice_idx < len(choices):
                template_type = choices[choice_idx]
                break
            print(f"无效选项，请输入 1 到 {len(choices)} 之间的数字。")
        except ValueError:
            print("无效输入，请输入数字。")

    while not (cur_title := input("请输入文档标题：").strip()):
        print("错误：输入不能为空！")

    problem_num = None
    if template_type == "LeetCode 题解":
        while True:
            result_str = input("请输入题目编号：").strip()
            if not result_str:
                print("操作已取消 (未输入有效题号)。")
                return
            try:
                problem_num = int(result_str)
                break
            except ValueError:
                print("错误：输入必须是有效的数字！")

    file_name = solve_filename(cur_title)
    file_path = POST_DIR / file_name
    if file_path.exists():
        print("文章创建已取消。")
        return

    try:
        content = generate_frontmatter(cur_title, problem_num, template_type)
        _ = file_path.write_text(content, encoding="utf-8")
        print(f"成功创建文件：{file_path.resolve()}")
    except (IOError, ValueError) as e:
        err_msg = (
            f"配置错误：{e}"
            if isinstance(e, ValueError)
            else f"错误：无法写入文件 {file_path}：{e}"
        )
        print(err_msg)


if __name__ == "__main__":
    create_post()
