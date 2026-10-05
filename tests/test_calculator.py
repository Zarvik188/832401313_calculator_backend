import pytest

from calculator import CalculationError, evaluate_expression, result_for_json


@pytest.mark.parametrize(
    ("expression", "expected"),
    [
        ("1+2*3", 7),
        ("(1+2)*3", 9),
        ("10/2+7", 12),
        ("-5+8", 3),
        ("3*-2", -6),
        ("0.5 + .25", 0.75),
        ("50%", 0.5),
        ("200*5%", 10),
    ],
)
def test_expression_calculation(expression, expected):
    assert result_for_json(evaluate_expression(expression)) == expected


@pytest.mark.parametrize("expression", ["", "1/0", "1+", "2**3", "1+abc", "(1+2"])
def test_invalid_expression(expression):
    with pytest.raises(CalculationError):
        evaluate_expression(expression)

