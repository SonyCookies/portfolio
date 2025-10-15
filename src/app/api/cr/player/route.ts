import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tagRaw = searchParams.get("tag");
  const token = process.env.CLASH_ROYALE_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "Server is missing CLASH_ROYALE_TOKEN" }, { status: 500 });
  }
  if (!tagRaw) {
    return NextResponse.json({ error: "Missing 'tag' query parameter" }, { status: 400 });
  }

  // Normalize tag: ensure no leading # for path, API expects URL-encoded # if present
  const tag = tagRaw.replace(/^#/, "");

  try {
    const res = await fetch(`https://api.clashroyale.com/v1/players/%23${encodeURIComponent(tag)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // Cache lightly to avoid rate limits; adjust as needed
      next: { revalidate: 60 },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || "Upstream error", details: data }, { status: res.status });
    }

    // Only return fields we need to reduce payload size
    const deck = Array.isArray(data.currentDeck) ? data.currentDeck : [];
    return NextResponse.json({
      name: data.name,
      tag: data.tag,
      clan: data.clan?.name ?? null,
      deck,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch from Clash Royale API", details: String(err) }, { status: 500 });
  }
}
