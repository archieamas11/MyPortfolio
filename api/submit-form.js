export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
    const RECIPIENT_EMAIL =
      process.env.RECIPIENT_EMAIL || "archiealbarico69@gmail.com";

    if (!TURNSTILE_SECRET || TURNSTILE_SECRET === "your_secret_key_here") {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const {
      name,
      email,
      subject,
      message,
      "cf-turnstile-response": turnstileToken,
    } = req.body;

    const errors = [];

    if (!name || name.length < 2 || name.length > 80) {
      errors.push("Name must be between 2 and 80 characters");
    }

    if (!email || !isValidEmail(email) || email.length > 254) {
      errors.push("Valid email address is required");
    }

    if (!subject || subject.length < 3 || subject.length > 120) {
      errors.push("Subject must be between 3 and 120 characters");
    }

    if (!message || message.length < 10 || message.length > 3000) {
      errors.push("Message must be between 10 and 3000 characters");
    }

    if (!turnstileToken) {
      errors.push("Please complete the security verification");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    const verificationResult = await verifyTurnstile(
      turnstileToken,
      TURNSTILE_SECRET
    );

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Security verification failed. Please try again.",
        details: verificationResult["error-codes"] || ["unknown-error"],
      });
    }

    const sanitizedData = {
      name: sanitize(name),
      email: sanitize(email),
      subject: sanitize(subject),
      message: sanitize(message),
    };

    const emailSent = await sendEmailViaWeb3Forms(
      sanitizedData,
      RECIPIENT_EMAIL
    );

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Thank you! Your message has been sent successfully.",
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Form submission error:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}

async function verifyTurnstile(token, secret) {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secret,
          response: token,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, "error-codes": ["network-error"] };
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitize(input) {
  if (typeof input !== "string") return "";
  input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function sendEmailViaWeb3Forms(data, recipientEmail) {
  try {
    const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Portfolio Contact: ${data.subject}`,
        from_name: data.name,
        email: data.email,
        message: data.message,
        to: recipientEmail,
      }),
    });

    const result = await response.json();
    return result.success;

    return response.ok;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
