import { updateUserLocaleSchema } from "@/src/lib/validations/user-preference";

export function parseUpdateUserLocaleInput(input: unknown) {
  return updateUserLocaleSchema.safeParse(input);
}
