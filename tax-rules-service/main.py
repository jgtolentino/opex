# tax_rules_service/main.py
# Deterministic PH VAT/WHT rules engine skeleton.
# Endpoint: POST /tax/validate-expense
#
# This is intentionally LLM-free. All numeric results must be from code.

from typing import List, Optional, Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import date

app = FastAPI(
    title="PH T&E Tax Rules Engine",
    description="Deterministic VAT/WHT calculator for expenses (no LLM).",
    version="0.1.0",
)

# ---------- Models ----------


class ExpenseLine(BaseModel):
    line_id: str
    description: Optional[str] = None
    net_amount: float = Field(..., ge=0.0)
    tax_code: Optional[str] = None
    withholding_code: Optional[str] = None
    vendor_tin: Optional[str] = None
    date: Optional[date] = None
    account: Optional[str] = None


class ExpenseRequest(BaseModel):
    expense_id: str
    reference: Optional[str] = None
    lines: List[ExpenseLine]


class LineResult(BaseModel):
    line_id: str
    status: Literal["ok", "warning", "error"]
    computed_vat: float
    computed_wht: float
    messages: List[str]


class ExpenseValidationResponse(BaseModel):
    expense_id: str
    overall_status: Literal["ok", "warnings", "fail"]
    line_results: List[LineResult]
    summary_messages: List[str]


# ---------- Simple rule helpers (PLACEHOLDER LOGIC) ----------

# TODO: Replace these with real PH rules from docs/ph_te_tax_rules.md

# Example: naive mapping of tax_code -> VAT rate
VAT_RATES = {
    "VAT-12": 0.12,
    "VAT-0": 0.00,
    "EXEMPT": 0.00,
}

# Example: naive mapping of withholding_code -> WHT rate
WHT_RATES = {
    "WHT-2": 0.02,
    "WHT-10": 0.10,
}


def compute_vat(net_amount: float, tax_code: Optional[str]) -> (float, List[str]):
    messages: List[str] = []
    if tax_code is None:
        messages.append("No tax_code provided; VAT assumed 0.")
        return 0.0, messages

    rate = VAT_RATES.get(tax_code)
    if rate is None:
        messages.append(
            f"Unknown tax_code '{tax_code}'; VAT assumed 0. Please review."
        )
        return 0.0, messages

    vat = round(net_amount * rate, 2)
    messages.append(
        f"Applied VAT rate {rate:.2%} for tax_code '{tax_code}'."
    )
    return vat, messages


def compute_wht(
    net_amount: float, withholding_code: Optional[str]
) -> (float, List[str]):
    messages: List[str] = []
    if withholding_code is None:
        messages.append("No withholding_code provided; WHT assumed 0.")
        return 0.0, messages

    rate = WHT_RATES.get(withholding_code)
    if rate is None:
        messages.append(
            f"Unknown withholding_code '{withholding_code}'; "
            "WHT assumed 0. Please review."
        )
        return 0.0, messages

    wht = round(net_amount * rate, 2)
    messages.append(
        f"Applied WHT rate {rate:.2%} for "
        f"withholding_code '{withholding_code}'."
    )
    return wht, messages


# ---------- Endpoint ----------


@app.post("/tax/validate-expense", response_model=ExpenseValidationResponse)
def validate_expense(expense: ExpenseRequest) -> ExpenseValidationResponse:
    if not expense.lines:
        raise HTTPException(status_code=400, detail="Expense has no lines.")

    line_results: List[LineResult] = []
    any_error = False
    any_warning = False

    total_vat = 0.0
    total_wht = 0.0

    for line in expense.lines:
        msgs: List[str] = []

        # Basic validation examples
        if line.net_amount < 0:
            msgs.append("Negative net_amount is not allowed.")
            status: Literal["ok", "warning", "error"] = "error"
            any_error = True
            line_results.append(
                LineResult(
                    line_id=line.line_id,
                    status=status,
                    computed_vat=0.0,
                    computed_wht=0.0,
                    messages=msgs,
                )
            )
            continue

        # Compute VAT and WHT (placeholder)
        vat, vat_msgs = compute_vat(line.net_amount, line.tax_code)
        wht, wht_msgs = compute_wht(line.net_amount, line.withholding_code)

        msgs.extend(vat_msgs)
        msgs.extend(wht_msgs)

        total_vat += vat
        total_wht += wht

        # Simple status heuristics
        status = "ok"
        if any("Unknown" in m for m in msgs):
            status = "warning"
            any_warning = True

        line_results.append(
            LineResult(
                line_id=line.line_id,
                status=status,  # 'ok' or 'warning' currently
                computed_vat=vat,
                computed_wht=wht,
                messages=msgs,
            )
        )

    # Overall status
    if any_error:
        overall_status: Literal["ok", "warnings", "fail"] = "fail"
    elif any_warning:
        overall_status = "warnings"
    else:
        overall_status = "ok"

    summary_messages = [
        f"Total VAT: {total_vat:.2f}",
        f"Total WHT: {total_wht:.2f}",
    ]

    # You can add more summary insights here:
    # - lines with unknown codes
    # - lines with missing vendor_tin
    # - date-based rules, etc.

    return ExpenseValidationResponse(
        expense_id=expense.expense_id,
        overall_status=overall_status,
        line_results=line_results,
        summary_messages=summary_messages,
    )


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PH T&E Tax Rules Engine"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
