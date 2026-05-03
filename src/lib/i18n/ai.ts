import { dictionaries } from "./dictionaries";
import type { AppLocale } from "./config";

export function getAiOutputLanguageInstruction(locale: AppLocale) {
  return dictionaries[locale].ai.outputLanguageInstruction;
}
