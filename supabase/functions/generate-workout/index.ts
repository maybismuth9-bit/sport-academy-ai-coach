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

    // Determine split structure based on days
    let splitInstructions = "";
    if (daysPerWeek <= 2) {
      splitInstructions = `This is a Full Body split. Each day should include 1 exercise per major muscle group (Legs, Back, Chest, Shoulders, Arms). Select exercises covering all groups each session.`;
    } else if (daysPerWeek === 3) {
      splitInstructions = `This is an A/B/C split:
- Day A: Chest, Shoulders, Triceps (Push day)
- Day B: Back, Biceps, Rear Delts (Pull day)  
- Day C: Legs, Core (Lower body day)
Select 2 exercises from the primary muscle group and 1-2 from the secondary groups for each day.`;
    } else if (daysPerWeek === 4) {
      splitInstructions = `This is an Upper/Lower split (A/B/A/B):
- Day A (Upper Push): Chest, Shoulders, Triceps
- Day B (Lower): Quads, Hamstrings, Glutes, Calves
- Day C (Upper Pull): Back, Biceps, Rear Delts
- Day D (Lower + Core): Legs, Core, Calves
Select 2-3 exercises per primary muscle group.`;
    } else {
      splitInstructions = `This is a ${daysPerWeek}-day bro split. Each day focuses on 1-2 muscle groups with 4-5 exercises. Distribute muscle groups evenly across days.`;
    }

    const prompt = `Generate a ${daysPerWeek}-day weekly workout plan.

${splitInstructions}

User focus preferences: ${focusText}

${equipmentContext}
${weightContext}

CRITICAL RULES:
1. Exercise ordering: ALWAYS list compound movements FIRST (e.g., Squats, Bench Press, Deadlifts, Overhead Press, Rows, Pull-ups), followed by isolation exercises (e.g., Curls, Lateral Raises, Leg Extensions, Cable Flyes).
2. Each exercise description MUST be exactly 3 lines maximum - concise form cues only.
3. Include 2-3 practical tips per exercise.
4. For each training day, provide 4-5 exercises.

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
          "description": "Lie flat on the bench with feet firmly on the floor. Grip the bar slightly wider than shoulder-width. Lower it to mid-chest, then press up explosively.",
          "tips": ["Keep your wrists straight", "Breathe in on the way down", "Don't bounce the bar"]
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
          { role: "system", content: "You are a professional strength & conditioning coach. Generate precise, science-based workout plans. ALWAYS order exercises with compound movements first, followed by isolation exercises. Descriptions must be exactly 3 lines max. Return ONLY valid JSON, no markdown or extra text." },
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
