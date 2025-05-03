import re
from datetime import date
from pathlib import Path
from typing import cast

import questionary
import typer

app = typer.Typer()


def get_post_dir() -> Path:
    project_root = Path(__file__).parent.parent
    post_dir = project_root / "src" / "content" / "posts"
    return post_dir


def sanitize_filename(title: str) -> str:
    sanitized = title.lower().replace(" ", "_")
    sanitized = re.sub(r"[^a-z0-9_\-]+", "", sanitized)
    sanitized = sanitized.strip("_").strip("-")
    if not sanitized:
        sanitized = "untitled"
    return sanitized + ".md"


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

    if template_type == "LeetCode 题解":
        assert qnum is not None, "LeetCode 模板必须提供题号"
        frontmatter["description"] = f"'LeetCode {qnum} 题解析'"
        frontmatter["tags"] = ["leetcode"]

    yaml = "---\n"
    for key, value in frontmatter.items():
        if isinstance(value, list):
            yaml += f"{key}:\n"
            for item in value:
                yaml += f"  - {item}\n"
        else:
            assert isinstance(value, str)
            if value.startswith("'") and value.endswith("'"):
                yaml += f"{key}: {value}\n"
            else:
                yaml += f"{key}: '{value}'\n"
    yaml += "---\n\n"
    return yaml


@app.command()
def create() -> None:
    template_type_result = cast(
        str | None,
        questionary.select(
            "选择要创建的文档类型：", choices=["普通帖子", "LeetCode 题解"]
        ).ask(),
    )

    if template_type_result is None:
        typer.echo("操作已取消。")
        raise SystemExit(0)
    template_type: str = template_type_result

    title_result = cast(str | None, questionary.text("请输入文档标题：").ask())
    if title_result is None:
        typer.echo("操作已取消。")
        raise SystemExit(0)
    while not title_result:
        typer.echo("错误：标题不能为空！")
        title_result = cast(str | None, questionary.text("请重新输入文档标题：").ask())
        if title_result is None:
            typer.echo("操作已取消。")
            raise SystemExit(0)
    title: str = title_result

    problem_number: int | None = None

    if template_type == "LeetCode 题解":
        problem_number_str_result = cast(
            str | None, questionary.text("请输入题目编号：").ask()
        )
        if problem_number_str_result is None:
            typer.echo("操作已取消。")
            raise SystemExit(0)

        while not problem_number_str_result or not problem_number_str_result.isdigit():
            typer.echo("错误：题号必须是有效的数字！")
            problem_number_str_result = questionary.text("请输入有效的题目编号：").ask()
            if problem_number_str_result is None:
                typer.echo("操作已取消。")
                raise SystemExit(0)

        problem_number_str: str = problem_number_str_result
        problem_number = int(problem_number_str)

    post_dir = get_post_dir()

    filename = sanitize_filename(title)
    filepath = post_dir / filename
    while filepath.exists():
        typer.echo(f"错误：文件 {filename} 已存在！")
        new_title_result = cast(str | None, questionary.text("请重新输入标题：").ask())
        if new_title_result is None:
            typer.echo("操作已取消。")
            raise SystemExit(0)

        while not new_title_result:
            typer.echo("错误：标题不能为空！")
            new_title_result = cast(
                str | None, questionary.text("请重新输入文档标题：").ask()
            )
            if new_title_result is None:
                typer.echo("操作已取消。")
                raise SystemExit(0)
        new_title: str = new_title_result
        title = new_title
        filename = sanitize_filename(title)
        filepath = post_dir / filename

    content = generate_frontmatter(
        template_type,
        title,
        problem_number,
    )

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        typer.echo(f"成功创建文件：{filepath.resolve()}")
    except IOError as e:
        typer.secho(f"错误：无法写入文件 {filepath}：{e}", fg="red")
        _ = SystemExit(1)
        raise _
    except Exception as e:
        typer.secho(f"创建文件时发生未知错误：{e}", fg="red")
        _ = SystemExit(1)
        raise _


if __name__ == "__main__":
    app()
