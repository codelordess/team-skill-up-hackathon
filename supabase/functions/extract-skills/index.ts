import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.length < 5) {
      return new Response(JSON.stringify({ error: "Description too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an AI talent analyst for SkillMap, a platform discovering hidden talent in the Global South.
Given a person's free-text description of their work, extract a structured talent profile.
Use one of these primary skill categories ONLY:
Frontend Development, Backend Development, Mobile Development, UI/UX Design, Graphic Design, Video Editing, Digital Marketing, Content Creation, Data & Analytics, Phone Repair, Tailoring, Photography.
Use one of these experience levels ONLY:
Beginner, Beginner–Intermediate, Intermediate, Intermediate–Advanced, Advanced.
Return concrete, employer-readable tools and skills (e.g. "React", "Figma", "Premiere Pro").`;

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
          { role: "user", content: description },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_profile",
            description: "Return structured talent profile",
            parameters: {
              type: "object",
              properties: {
                primarySkill: { type: "string" },
                detectedSkills: { type: "array", items: { type: "string" } },
                experienceLevel: { type: "string" },
                suggestedRoles: { type: "array", items: { type: "string" } },
                credibilityScore: { type: "integer", minimum: 30, maximum: 95 },
                reasoning: { type: "string" },
              },
              required: ["primarySkill", "detectedSkills", "experienceLevel", "suggestedRoles", "credibilityScore", "reasoning"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_profile" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-skills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
