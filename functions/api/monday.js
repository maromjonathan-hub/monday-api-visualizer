export async function onRequestPost(context) {
  const { request, env } = context;

  const token = env.MONDAY_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Missing MONDAY_TOKEN env var" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { query, variables } = body;

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Query missing" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const mondayRes = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ query, variables })
  });

  const text = await mondayRes.text();

  return new Response(text, {
    status: mondayRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
