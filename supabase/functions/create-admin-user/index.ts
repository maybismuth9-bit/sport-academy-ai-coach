import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create admin user with simple password
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "maeb9@walla.com",
    password: "123456",
    email_confirm: true,
    user_metadata: { first_name: "Admin" },
  });

  if (error) {
    // If user exists, update the password instead
    if (error.message?.includes("already")) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.users?.find((u: any) => u.email === "maeb9@walla.com");
      if (existing) {
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password: "123456",
          email_confirm: true,
        });
        if (updateErr) {
          return new Response(JSON.stringify({ error: updateErr.message }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ success: true, message: "Password updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, user_id: data.user.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
