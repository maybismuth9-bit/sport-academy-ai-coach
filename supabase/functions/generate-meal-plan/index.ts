import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, weight, height, age, activityLevel, allergies, mealFrequency, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", he: "Hebrew", es: "Spanish", zh: "Chinese", ar: "Arabic", de: "German",
    };
    const targetLang = langMap[language] || "English";

    const systemPrompt = `You are a certified sports nutritionist. Generate a complete weekly meal plan (7 days, Sunday through Saturday) based on the user's data. Each day must include meals with exact food items, amounts in grams, and calories. All meal names, food names, and day names must be in ${targetLang}. Include specific times for each meal (e.g. "07:00", "10:30", "13:00"). Format as structured JSON via the tool call.`;

    const userPrompt = `Create a weekly meal plan for:
- Goal: ${goal}
- Weight: ${weight}kg, Height: ${height}cm, Age: ${age}
- Activity level: ${activityLevel}/5
- Allergies: ${allergies || "None"}
- Meals per day: ${mealFrequency}

Generate a 7-day plan with ${mealFrequency} meals per day. Each meal must include: meal name (Breakfast/Lunch/Dinner/Snack), food items with amounts in grams, calories per item, and total daily calories.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_meal_plan",
            description: "Provide the weekly meal plan",
            parameters: {
              type: "object",
              properties: {
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string", description: "Day name (Sunday-Saturday)" },
                      totalCalories: { type: "number" },
                      meals: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            mealName: { type: "string" },
                            time: { type: "string" },
                            items: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  food: { type: "string" },
                                  amount: { type: "string" },
                                  calories: { type: "number" },
                                  protein: { type: "number" }
                                },
                                required: ["food", "amount", "calories"]
                              }
                            }
                          },
                          required: ["mealName", "time", "items"]
                        }
                      }
                    },
                    required: ["day", "totalCalories", "meals"]
                  }
                },
                weeklyAvgCalories: { type: "number" },
                summary: { type: "string" }
              },
              required: ["days", "weeklyAvgCalories", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_meal_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const mealPlan = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ plan: mealPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to generate meal plan" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
