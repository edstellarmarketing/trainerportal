const url = process.env.SERVICE_URL_SUPABASEKONG || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SERVICE_SUPABASESERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SERVICE_SUPABASEANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.SUPABASE_SCHEMA || "trainerportal";

if (!url || !serviceKey || !anonKey) {
  console.error("Missing Supabase URL, service key, or anon key environment variables.");
  process.exit(1);
}

const baseUrl = url.replace(/\/$/, "");

async function sql(query) {
  const res = await fetch(`${baseUrl}/pg/query`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function restCheck(headers) {
  const res = await fetch(`${baseUrl}/rest/v1/domains?select=id,name&limit=1`, { headers });
  return { status: res.status, body: await res.text() };
}

const existingSchemas = [
  "public",
  "storage",
  "graphql_public",
  "Marketing-PM-Tool",
  "Corporate-Assessment-Tool",
  "eggdrop",
  schema,
];

const dbSchemas = [...new Set(existingSchemas)].join(",");
const escapedDbSchemas = dbSchemas.replace(/'/g, "''");

try {
  console.log(`Setting PostgREST exposed schemas to: ${dbSchemas}`);
  await sql(`
    alter role authenticator set pgrst.db_schemas = '${escapedDbSchemas}';
    notify pgrst, 'reload config';
    notify pgrst, 'reload schema';
  `);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const defaultCheck = await restCheck({
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  });
  const profileCheck = await restCheck({
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Accept-Profile": schema,
  });

  console.log(`Default REST check: ${defaultCheck.status} ${defaultCheck.body.slice(0, 200)}`);
  console.log(`Schema REST check: ${profileCheck.status} ${profileCheck.body.slice(0, 200)}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
