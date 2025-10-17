export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const siteKey = process.env.TURNSTILE_SITE_KEY;

    if (!siteKey || siteKey === "your_site_key_here") {
      return res.status(500).json({
        error: "Turnstile not configured",
      });
    }

    return res.status(200).json({
      siteKey: siteKey,
    });
  } catch (error) {
    console.error("Error fetching Turnstile key:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
