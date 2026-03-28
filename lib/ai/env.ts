function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

export function getAiEnv() {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.1-pro",
    slidesGptApiKey: process.env.SLIDESGPT_API_KEY,
  };
}

export function requireGeminiEnv() {
  const env = getAiEnv();

  return {
    apiKey: requireEnv("GEMINI_API_KEY", env.geminiApiKey),
    model: env.geminiModel,
  };
}

export function requireSlidesGptEnv() {
  const env = getAiEnv();

  return {
    apiKey: requireEnv("SLIDESGPT_API_KEY", env.slidesGptApiKey),
  };
}
