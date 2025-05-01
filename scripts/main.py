import sys
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
    return title.lower().replace(" ", "_") + ".md"


def generate_frontmatter(
    template_type: str,
    title: str,
    qnum: int | None = None,
) -> str:
    frontmatter = {
        "title": f"'{title}'",
        "pubDate": date.today().strftime("%Y-%m-%d"),
        "description": "''",
        "tags": [""],
    }

    if template_type == "leetcode":
        assert qnum is not None, "LeetCode 模板必须提供题号"
        frontmatter["title"] = f"'{title}'"
        frontmatter["description"] = f"'LeetCode {qnum} 题解析'"
        frontmatter["tags"] = ["leetcode"]

    yaml = "---\n"
    for key, value in frontmatter.items():
        if isinstance(value, list):
            yaml += f"{key}: {value}\n"
        else:
            yaml += f"{key}: {value}\n"
    yaml += "---\n\n"
    return yaml


@app.command()
def create() -> None:
    template_type = cast(
        str,
        questionary.select(
            "选择要创建的文档类型：", choices=["普通帖子", "LeetCode 题解"]
        ).ask(),
    )

    title = cast(str, questionary.text("请输入文档标题：").ask())

    problem_number: int | None = None

    if template_type == "LeetCode 题解":
        problem_number_str = cast(str, questionary.text("请输入题目编号：").ask())
        while not problem_number_str.isdigit():
            typer.echo("错误：题号必须是数字！")
            problem_number_str = cast(
                str, questionary.text("请输入有效的题目编号：").ask()
            )
        problem_number = int(problem_number_str)

    try:
        post_dir = get_post_dir()
    except PermissionError as e:
        typer.secho(f"错误：无法创建目录 {e.filename}，请检查权限", fg="red")
        sys.exit(1)

    filename = sanitize_filename(title)
    filepath = post_dir / filename
    while filepath.exists():
        typer.echo(f"错误：文件 {filename} 已存在！")
        new_title = cast(str, questionary.text("请重新输入标题：").ask())
        filename = sanitize_filename(new_title)
        filepath = post_dir / filename

    processed_template_type = template_type.lower().replace(" ", "_")
    content = generate_frontmatter(
        processed_template_type,
        title,
        problem_number,
    )

    with open(filepath, "w") as f:
        f.write(content)
    typer.echo(f"成功创建文件：{filepath.resolve()}")


if __name__ == "__main__":
    app()
