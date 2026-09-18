import { NextRequest, NextResponse } from "next/server";
import { nlpTripRequestSchema, parsedTripIntentSchema } from "@/domain/travel/validation";
import { getLocationProvider } from "@/providers/location/location-provider";

/**
 * Natural-language trip parsing. AI only interprets what the customer typed
 * into structured search fields — it never invents flights, hotels, prices
 * or availability (spec §16). Output is Zod-validated before it ever reaches
 * the search form.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Natural-language search isn't configured. Use the form fields instead." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedInput = nlpTripRequestSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json({ error: "Tell us a bit more about your trip." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const model = "gemini-3.5-flash-lite";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You extract structured trip search fields (destination, dates, travelers, hotel star preference) from a traveler's free-text description. Today's date is ${today}. Never invent flights, hotels, prices, or availability — only extract what the user stated or clearly implied about their search preferences. Dates must be ISO (YYYY-MM-DD); if the user gives a relative date like "in October", pick a reasonable date this year or next if the month has passed. Leave fields null if not mentioned.`,
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: parsedInput.data.text }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                destination: { type: "string", nullable: true },
                originCity: { type: "string", nullable: true },
                departureDate: { type: "string", nullable: true },
                returnDate: { type: "string", nullable: true },
                adults: { type: "number", nullable: true },
                children: { type: "number", nullable: true },
                hotelStars: { type: "array", items: { type: "number" }, nullable: true },
                summary: { type: "string" },
              },
              required: [
                "destination",
                "originCity",
                "departureDate",
                "returnDate",
                "adults",
                "children",
                "hotelStars",
                "summary",
              ],
            },
          },
        }),
        signal: AbortSignal.timeout(20_000),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`);
    }

    const json = await response.json();
    const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Empty AI response");

    const rawIntent = JSON.parse(content);

    // The AI only names a destination in free text (e.g. "Phuket") — resolve
    // it to a real, bookable airport via the same Duffel Places data the
    // destination search box uses, so the form can select it directly.
    let destinationCode: string | null = null;
    let destinationLabel: string | null = null;
    if (typeof rawIntent.destination === "string" && rawIntent.destination.trim()) {
      try {
        const [match] = await getLocationProvider().searchAirports(rawIntent.destination);
        if (match) {
          destinationCode = match.code;
          destinationLabel = match.city;
        }
      } catch (lookupError) {
        console.error("Destination resolution failed", lookupError);
      }
    }

    const candidate = parsedTripIntentSchema.safeParse({
      ...rawIntent,
      destination: destinationCode,
      destinationLabel,
    });
    if (!candidate.success) {
      throw new Error("AI response didn't match the expected shape");
    }

    return NextResponse.json(candidate.data);
  } catch (error) {
    console.error("AI trip parsing failed", error);
    return NextResponse.json(
      { error: "We couldn't understand that just now — try the form fields instead." },
      { status: 502 }
    );
  }
}
