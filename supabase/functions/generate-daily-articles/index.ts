const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const categories = ["Strength", "Nutrition", "Recovery", "Physiology", "Performance"];

const topics = [
  "progressive overload methods", "muscle protein synthesis", "sleep optimization for athletes",
  "creatine supplementation", "HIIT training protocols", "intermittent fasting", "periodization",
  "cold exposure recovery", "hydration strategies", "warm-up techniques", "core stability training",
  "flexibility vs mobility", "carb cycling", "post-workout nutrition timing", "joint health",
  "mental toughness in training", "overtraining syndrome", "blood flow restriction training",
  "gut health for athletes", "caffeine and performance", "vitamin D and muscle function",
  "foam rolling benefits", "eccentric training", "plyometric exercises", "grip strength importance",
  "electrolyte balance", "omega-3 fatty acids", "tempo training", "deload strategies",
  "heat acclimation", "breathing techniques for lifting", "myofascial release", "isometric holds",
  "metabolic conditioning", "testosterone and training", "collagen for tendons", "sleep supplements",
  "training frequency optimization", "drop sets vs supersets", "anti-inflammatory foods",
  "ankle mobility", "shoulder health exercises", "hip hinge mechanics", "mind-muscle connection",
  "beta-alanine supplementation", "proprioception training", "active recovery methods",
  "glycogen replenishment", "resistance bands training", "unilateral training benefits",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check how many articles were added today
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`);

    if ((count || 0) >= 3) {
      return new Response(
        JSON.stringify({ message: "Already generated articles today", count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    // Pick 2-3 random topics
    const numArticles = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const shuffled = [...topics].sort(() => Math.random() - 0.5);
    const selectedTopics = shuffled.slice(0, numArticles);

    const prompt = `Generate ${numArticles} fitness/nutrition research article summaries. For each article provide:
- title: A compelling, specific article title (in Hebrew)
- category: One of: ${categories.join(", ")}
- summary: A 3-sentence evidence-based summary with specific numbers/data (in Hebrew)
- link: A real PubMed or research journal URL related to the topic (use pubmed.ncbi.nlm.nih.gov format)

IMPORTANT: The title and the first 3 sentences of the summary MUST be in Hebrew.

Topics to cover: ${selectedTopics.join(", ")}

Return ONLY a valid JSON array, no markdown, no explanation:
[{"title":"...","category":"...","summary":"...","link":"https://..."}]`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a sports science researcher. Return only valid JSON arrays. All article titles and summaries must be written in Hebrew." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI API error: ${res.status}`);

    const aiData = await res.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Clean markdown fences
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const newArticles = JSON.parse(content);

    // Insert into database
    const insertData = newArticles.map((a: any) => ({
      title: a.title,
      category: a.category || "General",
      summary: a.summary || "",
      link: a.link || null,
    }));

    const { error: insertError } = await supabase.from("articles").insert(insertData);
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, articlesAdded: insertData.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating daily articles:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
