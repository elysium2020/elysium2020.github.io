#!/usr/bin/env python3

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
        project_root = Path(__file__).resolve().parent.parent
        post_dir_cache = project_root / "src" / "content" / "posts"
        post_dir_cache.mkdir(parents=True, exist_ok=True)
    return post_dir_cache


def sanitize_filename(name: str) -> str:
    sanitized = FILENAME_SANITIZER.sub("", name.lower().replace(" ", "_"))
    sanitized = sanitized.strip("_").strip("-") or "untitled"
    return f"{sanitized}.md"


def generate_frontmatter(
    template_type: str,
    title: str,
    qnum: int | None = None,
) -> str:
    frontmatter_data: dict[str, str | list[str]] = {
        "title": title,
        "pubDate": date.today().strftime("%Y-%m-%d"),
        "description": "",
        "tags": [],
    }

    if template_type == TEMPLATE_TYPE_LEETCODE:
        if qnum is None:
            raise ValueError("LeetCode 模板必须提供题号 (qnum).")
        frontmatter_data["description"] = f"LeetCode {qnum} 题解析"
        frontmatter_data["tags"] = ["leetcode"]
    elif template_type == TEMPLATE_TYPE_NORMAL:
        frontmatter_data["tags"] = [""]

    yaml_lines = ["---"]
    for key, value in frontmatter_data.items():
        if isinstance(value, list):
            yaml_lines.append(f"{key}: {repr(value)}")
        elif key in ["title", "description"]:
            yaml_lines.append(f"{key}: '{value.replace("'", "''")}'")
        else:
            yaml_lines.append(f"{key}: {value}")

    yaml_lines.extend(["---", ""])
    return "\n".join(yaml_lines)


def with_keyboard_interrupt_handler(
    func: Callable[..., T],
) -> Callable[..., T | None]:
    def wrapper(*args: object, **kwargs: object) -> T | None:
        try:
            return func(*args, **kwargs)
        except KeyboardInterrupt:
            print("\n操作已取消 (KeyboardInterrupt).")
            sys.exit(0)

    return wrapper


@with_keyboard_interrupt_handler
def prompt_select(prompt_message: str, choices: list[str]) -> str | None:
    print(prompt_message)
    for i, choice_item in enumerate(choices, 1):
        print(f"{i}. {choice_item}")

    while True:
        choice_idx_str = input(
            f"请输入选项编号 (1-{len(choices)}), 或直接回车取消: "
        ).strip()
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
def prompt_text(prompt_message: str, allow_empty: bool = False) -> str:
    while True:
        result = input(prompt_message).strip()
        if result or allow_empty:
            return result
        print("错误：输入不能为空！")


@with_keyboard_interrupt_handler
def prompt_int(prompt_message: str) -> int | None:
    while True:
        result_str = input(f"{prompt_message} (或直接回车取消): ").strip()
        if not result_str:
            return None

        try:
            return int(result_str)
        except ValueError:
            print("错误：输入必须是有效的数字！")


def handle_file_exists(filepath: Path, current_title: str) -> tuple[bool, str]:
    print(f"错误：文件 {filepath.name} ({filepath.resolve()}) 已存在！")
    new_title_suggestion = prompt_text(
        "请重新输入标题 (或直接回车取消以保留原标题并覆盖，或输入全新标题): ",
        allow_empty=True,
    )

    if not new_title_suggestion:
        confirm_overwrite = (
            input(f"是否覆盖现有文件 '{filepath.name}'? (y/N): ").strip().lower()
        )
        if confirm_overwrite == "y":
            return True, current_title

        print("覆盖操作已取消。请提供新的标题或取消整个操作。")
        new_title_after_no_overwrite = prompt_text(
            "请为不覆盖文件输入新标题 (或直接回车取消整个文章创建): ",
            allow_empty=True,
        )
        if not new_title_after_no_overwrite:
            return False, current_title
        return True, new_title_after_no_overwrite

    return True, new_title_suggestion


def write_post_file(filepath: Path, content: str) -> None:
    try:
        _ = filepath.write_text(content, encoding="utf-8")
        print(f"成功创建文件：{filepath.resolve()}")
    except IOError as e:
        print(f"错误：无法写入文件 {filepath}：{e}")
        sys.exit(1)
    except ValueError as e:
        print(f"配置错误：{e}")
        sys.exit(1)


def create_post() -> None:
    template_type = prompt_select("选择要创建的文档类型：", TEMPLATE_CHOICES)
    if template_type is None:
        print("操作已取消 (未选择模板类型)。")
        return

    title_str = prompt_text("请输入文档标题：")
    if not title_str:
        print("标题不能为空白，操作取消。")
        return

    current_title = title_str
    problem_number: int | None = None

    if template_type == TEMPLATE_TYPE_LEETCODE:
        problem_number = prompt_int("请输入题目编号")
        if problem_number is None:
            print("操作已取消 (未输入有效题号)。")
            return

    post_dir = get_post_dir()

    while True:
        filename = sanitize_filename(current_title)
        filepath = post_dir / filename

        if not filepath.exists():
            break

        should_continue, new_title = handle_file_exists(filepath, current_title)
        if not should_continue:
            print("文章创建已取消。")
            return
        current_title = new_title

    content = generate_frontmatter(template_type, current_title, problem_number)
    write_post_file(filepath, content)


def main() -> int:
    try:
        create_post()
        return 0
    except SystemExit as e:
        return e.code if isinstance(e.code, int) else 1
    except (IOError, ValueError) as e:
        print(f"脚本执行时发生错误: {e}")
        return 1
    except KeyboardInterrupt:
        print("\n操作已取消 (KeyboardInterrupt).")
        return 0


if __name__ == "__main__":
    sys.exit(main())
