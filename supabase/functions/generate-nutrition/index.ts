import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { assessmentData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a certified sports nutritionist and fitness expert. Based on the user's assessment data, calculate precise daily calorie and macronutrient targets. 

Use the Mifflin-St Jeor equation for BMR, then apply activity multipliers and goal adjustments.

Activity multipliers:
- 1 (Sedentary): 1.2
- 2 (Lightly Active): 1.375
- 3 (Moderately Active): 1.55
- 4 (Very Active): 1.725
- 5 (Athlete): 1.9

Goal adjustments:
- Weight Loss: -20% calories
- Muscle Mass: +15% calories
- Maintenance: no change

You MUST respond by calling the provide_nutrition_plan function with the calculated data.`;

    const userPrompt = `Calculate nutrition targets for this person:
- Age: ${assessmentData.age} years
- Weight: ${assessmentData.weight} kg
- Height: ${assessmentData.height} cm
- Body Fat: ${assessmentData.bodyFat}%
- Goal: ${assessmentData.goal}
- Activity Level: ${assessmentData.activityLevel}/5
- Allergies: ${assessmentData.allergies.join(", ") || "None"}
- Meals per day: ${assessmentData.mealFrequency}
- Workout days/week: ${assessmentData.workoutDays}
- Workout duration: ${assessmentData.workoutDuration} minutes
- Injuries: ${assessmentData.injuries || "None"}

Provide precise daily calorie and macro targets (protein, carbs, fat in grams).`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "provide_nutrition_plan",
              description: "Provide the calculated nutrition plan",
              parameters: {
                type: "object",
                properties: {
                  calories: { type: "number", description: "Daily calorie target" },
                  protein: { type: "number", description: "Daily protein in grams" },
                  carbs: { type: "number", description: "Daily carbs in grams" },
                  fat: { type: "number", description: "Daily fat in grams" },
                  fiber: { type: "number", description: "Daily fiber in grams" },
                  water: { type: "number", description: "Daily water in liters" },
                  summary: { type: "string", description: "Brief explanation of the plan (2-3 sentences)" },
                },
                required: ["calories", "protein", "carbs", "fat", "fiber", "water", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_nutrition_plan" } },
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
      const nutritionPlan = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ plan: nutritionPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to generate plan" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
