import { z } from "zod";

import { SUPPORTED_LOCALES } from "@/src/lib/i18n/config";

export const updateUserLocaleSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
});
