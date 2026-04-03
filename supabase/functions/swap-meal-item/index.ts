import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, currentMeal, currentItem, goal, allergies, language, dailyCalories, mealCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", he: "Hebrew", es: "Spanish", zh: "Chinese", ar: "Arabic", de: "German",
    };
    const targetLang = langMap[language] || "English";

    let systemPrompt = `You are a sports nutritionist. All text in ${targetLang}. Return ONLY valid JSON, no markdown.`;
    let userPrompt = "";

    if (mode === "swap_item") {
      systemPrompt += " Replace one food item in a meal with a similar-calorie alternative.";
      userPrompt = `Replace "${currentItem.food}" (${currentItem.calories} cal, ${currentItem.protein || 0}g protein, amount: ${currentItem.amount}) with a different food of similar calories. Allergies: ${allergies || "None"}.
Return JSON: {"food":"<name>","amount":"<grams>","calories":<n>,"protein":<n>}`;
    } else if (mode === "swap_meal") {
      const itemsDesc = currentMeal.items.map((i: any) => `${i.food} ${i.calories}cal`).join(", ");
      const totalCals = currentMeal.items.reduce((s: number, i: any) => s + i.calories, 0);
      systemPrompt += " Replace an entire meal with a different meal of similar total calories.";
      userPrompt = `Replace meal "${currentMeal.mealName}" (time: ${currentMeal.time}, items: ${itemsDesc}, total ~${totalCals} cal) with a completely different meal of similar calories. Allergies: ${allergies || "None"}.
Return JSON: {"mealName":"${currentMeal.mealName}","time":"${currentMeal.time}","items":[{"food":"<name>","amount":"<grams>","calories":<n>,"protein":<n>}]}`;
    } else if (mode === "adjust_meals") {
      systemPrompt += " Redistribute a day's calories across a different number of meals.";
      userPrompt = `I need ${mealCount} meals for a day with ~${dailyCalories} daily calories. Goal: ${goal || "maintenance"}. Allergies: ${allergies || "None"}.
Return JSON: {"meals":[{"mealName":"<name>","time":"<HH:MM>","items":[{"food":"<name>","amount":"<grams>","calories":<n>,"protein":<n>}]}],"totalCalories":<number>}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const result = JSON.parse(content);
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Parse error:", content.slice(0, 300));
      return new Response(JSON.stringify({ error: "Failed to parse response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
