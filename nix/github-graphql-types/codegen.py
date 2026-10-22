"""
Generate Python types for the GitHub GraphQL schema, annotated for type checkers.
"""

import sys
from functools import cached_property
from typing import Any

from graphql import build_schema, introspection_from_schema
from sgqlc.codegen.schema import CodeGen, default_type_imports
from sgqlc.types import BaseItem

# sgqlc converts these to Python values, other scalars are passed through as raw JSON strings.
SCALARS = {
    "Boolean": "bool",
    "Int": "int",
    "Float": "float",
    "String": "str",
    "ID": "str",
    "Date": "_datetime.date",
    "DateTime": "_datetime.datetime",
}


class AnnotatedCodeGen(CodeGen):
    def annotation(self, type_: dict[str, Any]) -> str:
        if type_["kind"] == "NON_NULL":
            return self.inner(type_["ofType"])
        return f"{self.inner(type_)} | None"

    def inner(self, type_: dict[str, Any]) -> str:
        match type_["kind"]:
            case "LIST":
                return f"list[{self.annotation(type_['ofType'])}]"
            case "SCALAR":
                return SCALARS.get(type_["name"], "str")
            case "ENUM":
                values = ", ".join(map(repr, self.enums[type_["name"]]))
                return f"_typing.Literal[{values}]"
            case _:
                return type_["name"]

    @cached_property
    def enums(self) -> dict[str, list[str]]:
        return {
            type_["name"]: [value["name"] for value in type_["enumValues"]]
            for type_ in self.schema["types"]
            if type_["kind"] == "ENUM"
        }

    def write_header(self) -> None:
        # Aliased so they can't collide with fields of the same name.
        self.writer("import datetime as _datetime\n")
        self.writer("import typing as _typing\n")
        super().write_header()

    def write_field_output(self, field: dict[str, Any], siblings: set[str]) -> None:
        writer = self.writer
        name = BaseItem._to_python_name(field["name"])
        annotation = self.annotation(field["type"])

        def annotate(text: str) -> None:
            prefix = f"    {name} = "
            if text.startswith(prefix):
                text = f"    {name}: {annotation!r} = " + text[len(prefix) :]
            writer(text)

        # The parent writes a field in several chunks, of which only the first one carries the name.
        self.writer = annotate
        try:
            super().write_field_output(field, siblings)
        finally:
            self.writer = writer


introspection = introspection_from_schema(build_schema(sys.stdin.read()))
AnnotatedCodeGen(
    "github", introspection["__schema"], sys.stdout.write, False, default_type_imports
).write()
