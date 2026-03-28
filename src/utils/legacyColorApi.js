export async function requestLegacyPalette({
  industry,
  emotion,
  endpoint = "http://127.0.0.1:8000/generate-palette",
}) {
  const url = new URL(endpoint);
  url.searchParams.set("industry", industry || "healthcare");
  url.searchParams.set("emotion", emotion || "professional");

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    let detail = "Palette request failed.";
    try {
      const json = await res.json();
      detail = json?.detail || json?.error || detail;
    } catch {
      // ignore json parsing error
    }
    throw new Error(detail);
  }

  const data = await res.json();
  const palette = Array.isArray(data?.palette) ? data.palette : [];
  if (!palette.length) {
    throw new Error("API returned an empty palette.");
  }

  return {
    palette,
    explanations: Array.isArray(data?.explanations) ? data.explanations : [],
    raw: data,
  };
}
