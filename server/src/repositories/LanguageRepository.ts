import { Language } from "@/domain/Language";

export interface LanguageRepository {
  save(language: Language): Promise<void>;
  find(isoCode: string): Promise<Language | null>;
}
