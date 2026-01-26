export async function onRequestPost(context) {
  const { request, env } = context;

  // Store your monday token as a Cloudflare environment variable named MONDAY_TOKEN
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

  const query = body?.query;
  const variables = body?.variables;

  if (!query || typeof query !== "string") {
    return new Response(JSON.stringify({ error: "Body must include { query: string }" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const mondayRes = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ query, variables })
  });

  const mondayText = await mondayRes.text();

  // Pass through status + response
  return new Response(mondayText, {
    status: mondayRes.status,
    headers: {
      "Content-Type": "application/json",
      // Allow your own site to call this function:
      "Access-Control-Allow-Origin": "*"
    }
  });
}
