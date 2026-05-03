import "server-only";

export function getExtractModel() {
  const model = process.env.OPENAI_MODEL_EXTRACT;

  if (!model) {
    throw new Error("OPENAI_MODEL_EXTRACT is not configured.");
  }

  return model;
}

export function getParseModel() {
  const model = process.env.OPENAI_MODEL_PARSE;

  if (!model) {
    throw new Error("OPENAI_MODEL_PARSE is not configured.");
  }

  return model;
}
