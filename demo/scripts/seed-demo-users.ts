/**
 * Seed script — creates/resets demo users in Supabase using the Admin API.
 *
 * Run once before using the demo:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-demo-users.ts
 *
 * Or create a .env.seed file (see .env.seed.example) and run:
 *   npm run seed
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Minimal inline .env.seed loader (no dotenv dependency needed)
try {
  const lines = readFileSync(new URL("../.env.seed", import.meta.url), "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.seed not present — rely on environment variables being set directly
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, " +
    "or create a .env.seed file (see .env.seed.example)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "demo-quickchat-2024";

const DEMO_USERS = [
  { email: "alice@myamazingstartup.io",  name: "Alice Mercer",  avatar: "https://i.pravatar.cc/150?img=47" },
  { email: "ben@myamazingstartup.io",    name: "Ben Hartley",   avatar: "https://i.pravatar.cc/150?img=12" },
  { email: "clara@myamazingstartup.io",  name: "Clara Zhou",    avatar: "https://i.pravatar.cc/150?img=5"  },
  { email: "daniel@myamazingstartup.io", name: "Daniel Osei",   avatar: "https://i.pravatar.cc/150?img=68" },
  { email: "eva@myamazingstartup.io",    name: "Eva Larsson",   avatar: "https://i.pravatar.cc/150?img=9"  },
];

async function seed() {
  console.log("Fetching existing users...");
  const { data, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const existing = new Map(data.users.map((u) => [u.email, u]));

  for (const demo of DEMO_USERS) {
    const found = existing.get(demo.email);

    if (found) {
      // Reset password so it always matches DEMO_PASSWORD (handles prior built-in auth signups)
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: DEMO_PASSWORD,
        user_metadata: { display_name: demo.name, avatar_url: demo.avatar },
      });
      if (error) console.error(`  ✗ ${demo.email}: ${error.message}`);
      else       console.log(`  ✓ Updated: ${demo.email} (id: ${found.id})`);
    } else {
      // Create fresh — email_confirm: true skips confirmation email
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: demo.name, avatar_url: demo.avatar },
      });
      if (error) console.error(`  ✗ ${demo.email}: ${error.message}`);
      else       console.log(`  ✓ Created: ${demo.email} (id: ${created.user.id})`);
    }
  }

  console.log("\nDone! Demo users are ready. You can now run the demo app.");
}

seed().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
