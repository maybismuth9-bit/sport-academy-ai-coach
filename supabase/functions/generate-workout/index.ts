import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { daysPerWeek, focusAreas, equipment, language, previousWeights } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", he: "Hebrew", es: "Spanish", zh: "Chinese", ar: "Arabic", de: "German",
    };
    const targetLang = langMap[language] || "English";

    const equipmentContext = equipment && equipment.length > 0
      ? `The user has the following equipment available: ${equipment.join(", ")}. Design exercises using ONLY this equipment.`
      : "The user has access to a full gym with all standard equipment.";

    const weightContext = previousWeights && Object.keys(previousWeights).length > 0
      ? `Here are the user's previous weights for reference (use these as starting points): ${JSON.stringify(previousWeights)}`
      : "";

    const focusText = focusAreas && focusAreas.length > 0
      ? focusAreas.join(", ")
      : "Full Body";

    const prompt = `Generate a ${daysPerWeek}-day weekly workout plan focused on: ${focusText}.

${equipmentContext}
${weightContext}

For each training day, provide:
- A day label (Day A, Day B, etc.)
- A focus description
- 4-5 exercises, each with: name, muscle group, sets (number), reps (string like "8-10"), rest time, suggested starting weight in kg, a detailed description (2-3 sentences explaining proper form and technique), and 2-3 practical tips

Return ONLY valid JSON in this exact format:
{
  "days": [
    {
      "label": "Day A",
      "focus": "Push (Chest/Shoulders/Triceps)",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "muscle": "Chest",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s",
          "weight": "60kg",
          "description": "Lie flat on the bench with feet firmly on the floor. Grip the bar slightly wider than shoulder-width, lower it to mid-chest, then press up explosively while keeping your shoulder blades retracted.",
          "tips": ["Keep your wrists straight and aligned with your forearms", "Breathe in on the way down, exhale on the press", "Don't bounce the bar off your chest"]
        }
      ]
    }
  ]
}

Important: Exercise names, descriptions, tips, and focus descriptions should all be in ${targetLang}. Keep muscle group names short.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional strength & conditioning coach. Generate precise, science-based workout plans. Return ONLY valid JSON, no markdown or extra text." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const plan = JSON.parse(content);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-workout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
