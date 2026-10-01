"""A small, safe mathematical expression parser.

The parser accepts numbers, parentheses, +, -, *, and /.  It never executes
the input as Python code, so user input cannot become arbitrary code.
"""

from decimal import Decimal, InvalidOperation
import re


class CalculationError(ValueError):
    """An error that can be shown to the calculator user."""


TOKEN_RE = re.compile(r"\d+(?:\.\d*)?|\.\d+|[()+\-*/]")


def tokenize(expression: str) -> list[str]:
    if not isinstance(expression, str) or not expression.strip():
        raise CalculationError("Expression cannot be empty")
    if len(expression) > 200:
        raise CalculationError("Expression is too long")

    tokens: list[str] = []
    position = 0
    while position < len(expression):
        if expression[position].isspace():
            position += 1
            continue
        match = TOKEN_RE.match(expression, position)
        if not match:
            raise CalculationError(f"Invalid character: {expression[position]}")
        tokens.append(match.group())
        position = match.end()
    return tokens


class Parser:
    def __init__(self, tokens: list[str]):
        self.tokens = tokens
        self.position = 0

    def current(self) -> str | None:
        if self.position >= len(self.tokens):
            return None
        return self.tokens[self.position]

    def take(self) -> str:
        token = self.current()
        if token is None:
            raise CalculationError("Incomplete expression")
        self.position += 1
        return token

    def parse(self) -> Decimal:
        result = self.parse_expression()
        if self.current() is not None:
            raise CalculationError(f"Unexpected token: {self.current()}")
        return result

    def parse_expression(self) -> Decimal:
        result = self.parse_term()
        while self.current() in {"+", "-"}:
            operator = self.take()
            right = self.parse_term()
            result = result + right if operator == "+" else result - right
        return result

    def parse_term(self) -> Decimal:
        result = self.parse_unary()
        while self.current() in {"*", "/"}:
            operator = self.take()
            right = self.parse_unary()
            if operator == "*":
                result *= right
            else:
                if right == 0:
                    raise CalculationError("Division by zero is not allowed")
                result /= right
        return result

    def parse_unary(self) -> Decimal:
        if self.current() == "+":
            self.take()
            return self.parse_unary()
        if self.current() == "-":
            self.take()
            return -self.parse_unary()
        return self.parse_primary()

    def parse_primary(self) -> Decimal:
        token = self.current()
        if token == "(":
            self.take()
            result = self.parse_expression()
            if self.current() != ")":
                raise CalculationError("Missing closing parenthesis")
            self.take()
            return result
        if token is None or token in {")", "+", "-", "*", "/"
        }:
            raise CalculationError("A number or opening parenthesis was expected")
        self.take()
        try:
            return Decimal(token)
        except InvalidOperation as exc:
            raise CalculationError("Invalid number") from exc


def evaluate_expression(expression: str) -> Decimal:
    return Parser(tokenize(expression)).parse()


def result_for_json(value: Decimal) -> int | float:
    """Convert Decimal to a JSON-friendly number without returning -0."""
    if value == value.to_integral_value():
        return int(value)
    return float(value)

