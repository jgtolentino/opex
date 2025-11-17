// supabase/functions/odoo-expense-get/index.ts
// Edge function: POST /odoo/expense/get
// Body: { expense_id: string }
// Proxies to Odoo endpoint /ipai_te_tax/expense/<id>

type GetExpenseRequest = {
  expense_id: string;
};

const ODOO_EXPENSE_API_BASE = Deno.env.get("ODOO_EXPENSE_API_BASE") ?? "";
// Example: "https://odoo.yourdomain.com/ipai_te_tax/expense"

const ODOO_AUTH_TOKEN = Deno.env.get("ODOO_AUTH_TOKEN") ?? "";
// Optional: for custom auth headers if you implement token auth on Odoo side

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: GetExpenseRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const expenseId = (body.expense_id || "").trim();
  if (!expenseId) {
    return new Response(
      JSON.stringify({ error: "Missing 'expense_id' in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!ODOO_EXPENSE_API_BASE) {
    return new Response(
      JSON.stringify({ error: "ODOO_EXPENSE_API_BASE not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = `${ODOO_EXPENSE_API_BASE.replace(/\/$/, "")}/${encodeURIComponent(expenseId)}`;

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (ODOO_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${ODOO_AUTH_TOKEN}`;
    }

    const odooResp = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!odooResp.ok) {
      const text = await odooResp.text();
      console.error("Odoo API error:", odooResp.status, text);
      return new Response(
        JSON.stringify({
          error: "Odoo API error",
          status: odooResp.status,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await odooResp.json();

    if ((data as any).error) {
      return new Response(JSON.stringify(data), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the JSON directly; n8n expects fields: id, reference, lines, etc.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error calling Odoo expense API:", e);
    return new Response(
      JSON.stringify({ error: "Failed to reach Odoo expense API" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
});
