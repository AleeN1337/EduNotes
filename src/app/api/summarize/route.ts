import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  id: string;
  content: string | null;
  created_at: string;
  user_id: string;
  image_url?: string | null;
};

function buildPrompt(messages: ChatMessage[], locale: string = "pl") {
  const localeHints: Record<string, string> = {
    pl: "Napisz podsumowanie po polsku. Uwzględnij najważniejsze punkty, decyzje, elementy do zrobienia (To-Do) z terminami, i pytania otwarte. Bądź zwięzły.",
    en: "Write the summary in English. Include key points, decisions, action items with due dates, and open questions. Keep it concise.",
  };
  const instruction = localeHints[locale] || localeHints.pl;

  const head = `You are an assistant that summarizes chat notes/messages. ${instruction}`;
  const examples = `Format:
- Krótkie streszczenie
- Najważniejsze punkty (wypunktowane)
- Decyzje
- To-Do (osoba, zadanie, termin jeśli jest)
- Pytania otwarte
`;

  // Limit content size: keep last ~60 messages and cap each content length
  const trimmed = messages.slice(-60).map((m) => ({
    t: new Date(m.created_at).toLocaleString(),
    u: m.user_id,
    c: (m.content || "").slice(0, 2000),
    img: !!m.image_url,
  }));

  const serialized = JSON.stringify(trimmed, null, 2);
  const userContent = `Zasób do podsumowania (ostatnie wiadomości):\n${serialized}`;
  return { head, examples, userContent };
}

async function callAzureOpenAI(system: string, user: string) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";
  if (!endpoint || !apiKey || !deployment) return null;

  const url = `${endpoint.replace(
    /\/$/,
    ""
  )}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });
  if (!resp.ok) throw new Error(`Azure OpenAI error: ${resp.status}`);
  const data = await resp.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  return text ?? null;
}

async function callOpenAI(system: string, user: string) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!key) return null;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  return text ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, locale } = (await req.json()) as {
      messages: ChatMessage[];
      locale?: string;
    };
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { head, examples, userContent } = buildPrompt(messages, locale);

    let summary: string | null = null;
    // Prefer Azure OpenAI when configured
    try {
      summary = await callAzureOpenAI(`${head}\n\n${examples}`, userContent);
    } catch (e) {
      // fall through to OpenAI
    }
    if (!summary) {
      try {
        summary = await callOpenAI(`${head}\n\n${examples}`, userContent);
      } catch (e) {
        // ignored
      }
    }

    if (!summary) {
      // Safe fallback: naive extractive summary (first/last few messages)
      const first = messages
        .slice(0, 3)
        .map((m) => m.content)
        .filter(Boolean);
      const last = messages
        .slice(-3)
        .map((m) => m.content)
        .filter(Boolean);
      const fallback = [
        "(Tryb awaryjny — brak skonfigurowanego dostawcy AI)",
        "Skrót rozmowy:",
        ...first.map((c) => `• ${c}`),
        "…",
        ...last.map((c) => `• ${c}`),
      ].join("\n");
      return NextResponse.json({ summary: fallback, provider: "fallback" });
    }

    return NextResponse.json({ summary, provider: "ai" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Summarization failed" },
      { status: 500 }
    );
  }
}
