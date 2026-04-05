import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { painArea, description, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", he: "Hebrew", es: "Spanish", zh: "Chinese", ar: "Arabic", de: "German",
    };
    const targetLang = langMap[language] || "English";

    const prompt = `The user reports pain/discomfort in: "${painArea}"
Additional details: "${description || "No additional details"}"

As a sports physiotherapist, provide:
1. A brief assessment of possible causes (2-3 common causes)
2. Risk level (low/medium/high) and whether they should see a doctor
3. 4-6 specific rehabilitation/stretching exercises to help, each with:
   - Exercise name
   - Duration or reps
   - Clear 2-line instruction
   - Difficulty level (beginner/intermediate/advanced)

IMPORTANT: All text must be in ${targetLang}.

Return ONLY valid JSON in this format:
{
  "assessment": {
    "possibleCauses": ["cause1", "cause2"],
    "riskLevel": "low|medium|high",
    "shouldSeeDoctor": false,
    "doctorNote": "optional note about when to see doctor"
  },
  "exercises": [
    {
      "name": "Exercise Name",
      "duration": "3x15 reps" or "30 seconds",
      "instruction": "Two line instruction here",
      "difficulty": "beginner|intermediate|advanced",
      "bodyPart": "target area"
    }
  ],
  "generalAdvice": "Brief general recovery advice"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are an expert sports physiotherapist. Provide evidence-based exercise rehabilitation advice. Always recommend seeing a doctor for severe pain. Return ONLY valid JSON, no markdown. All text in ${targetLang}.` },
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
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("physio-diagnosis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
