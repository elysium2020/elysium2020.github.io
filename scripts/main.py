#!/usr/bin/env python

import re
import sys
from datetime import date
from pathlib import Path
from typing import Callable, TypeVar

FILENAME_SANITIZER = re.compile(r"[^a-z0-9_\-.]+")

TEMPLATE_TYPE_LEETCODE = "LeetCode 题解"
TEMPLATE_TYPE_NORMAL = "普通帖子"
TEMPLATE_CHOICES = [TEMPLATE_TYPE_NORMAL, TEMPLATE_TYPE_LEETCODE]

post_dir_cache: Path | None = None

T = TypeVar("T")


def get_post_dir() -> Path:
    global post_dir_cache

    if post_dir_cache is None:
        project_root = Path(__file__).parent.parent
        post_dir_cache = project_root / "src" / "content" / "posts"
        post_dir_cache.mkdir(parents=True, exist_ok=True)

    return post_dir_cache


def sanitize_filename(title: str) -> str:
    sanitized = FILENAME_SANITIZER.sub("", title.lower().replace(" ", "_"))
    sanitized = sanitized.strip("_").strip("-") or "untitled"
    return f"{sanitized}.md"


def generate_frontmatter(
    template_type: str,
    title: str,
    qnum: int | None = None,
) -> str:
    frontmatter: dict[str, str | list[str]] = {
        "title": f"'{title}'",
        "pubDate": date.today().strftime("%Y-%m-%d"),
        "description": "''",
        "tags": [],
    }

    if template_type == TEMPLATE_TYPE_LEETCODE:
        if qnum is None:
            raise ValueError("LeetCode 模板必须提供题号")
        frontmatter["description"] = f"'LeetCode {qnum} 题解析'"
        frontmatter["tags"] = ["leetcode"]
    elif template_type == TEMPLATE_TYPE_NORMAL:
        frontmatter["tags"] = [""]

    yaml_lines = ["---"]
    yaml_lines.extend(
        f"{key}: {repr(value) if isinstance(value, list) else value}"
        for key, value in frontmatter.items()
    )
    yaml_lines.extend(["---", ""])

    return "\n".join(yaml_lines)


def with_keyboard_interrupt_handler(
    func: Callable[..., T],
) -> Callable[..., T | None]:
    def wrapper(*args: object, **kwargs: object) -> T | None:
        try:
            return func(*args, **kwargs)
        except KeyboardInterrupt:
            print("\n操作已取消。")
            sys.exit(0)

    return wrapper


@with_keyboard_interrupt_handler
def prompt_select(prompt_message: str, choices: list[str]) -> str | None:
    print(prompt_message)
    for i, choice in enumerate(choices, 1):
        print(f"{i}. {choice}")

    while True:
        choice_idx_str = input(f"请输入选项编号 (1-{len(choices)}), 或直接回车取消: ")
        if not choice_idx_str:
            return None

        try:
            choice_idx = int(choice_idx_str) - 1
            if 0 <= choice_idx < len(choices):
                return choices[choice_idx]
            print(f"无效选项，请输入 1 到 {len(choices)} 之间的数字。")
        except ValueError:
            print("无效输入，请输入数字。")


@with_keyboard_interrupt_handler
def prompt_text(prompt_message: str, allow_empty: bool = False) -> str | None:
    while True:
        result = input(prompt_message)
        if result or allow_empty:
            return result
        print("错误：输入不能为空！")


@with_keyboard_interrupt_handler
def prompt_int(prompt_message: str) -> int | None:
    while True:
        result_str = input(f"{prompt_message} (或直接回车取消): ")
        if not result_str:
            return None

        try:
            return int(result_str)
        except ValueError:
            print("错误：输入必须是有效的数字！")


def create_post() -> None:
    template_type = prompt_select("选择要创建的文档类型：", TEMPLATE_CHOICES)
    if template_type is None:
        print("操作已取消。")
        return

    title = prompt_text("请输入文档标题：")
    if not title or not title.strip():
        print("操作已取消或标题为空。")
        return

    problem_number: int | None = None
    if template_type == TEMPLATE_TYPE_LEETCODE:
        problem_number = prompt_int("请输入题目编号")
        if problem_number is None:
            print("操作已取消或题号输入无效。")
            return

    post_dir = get_post_dir()
    filename = sanitize_filename(title)
    filepath = post_dir / filename

    while filepath.exists():
        print(f"错误：文件 {filename} 已存在！")
        new_title = prompt_text("请重新输入标题 (或直接回车取消): ", allow_empty=True)
        if not new_title or not new_title.strip():
            print("操作已取消或未提供新标题。")
            return

        title = new_title
        filename = sanitize_filename(title)
        filepath = post_dir / filename

    try:
        content = generate_frontmatter(template_type, title, problem_number)
        _ = filepath.write_text(content, encoding="utf-8")
        print(f"成功创建文件：{filepath.resolve()}")
    except IOError as e:
        print(f"错误：无法写入文件 {filepath}：{e}")
        sys.exit(1)
    except Exception as e:
        print(f"创建文件时发生未知错误：{e}")
        sys.exit(1)


def main() -> int:
    try:
        create_post()
        return 0
    except SystemExit as e:
        if isinstance(e.code, int):
            return e.code
        return 1
    except KeyboardInterrupt:
        print("\n操作被用户中断。")
        return 1


if __name__ == "__main__":
    sys.exit(main())
