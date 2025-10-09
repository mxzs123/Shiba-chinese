export type TranslationDictionary = Record<string, string | TranslationDictionary>;

export interface LocaleMessages {
  locale: string;
  namespace: string;
  messages: TranslationDictionary;
}

export type MessagesLoader = (
  locale: string,
  namespace: string,
) => Promise<LocaleMessages>;

export function createStaticMessagesLoader(
  dictionaries: Record<string, Record<string, TranslationDictionary>>,
): MessagesLoader {
  return async (locale, namespace) => {
    const messages = dictionaries[locale]?.[namespace] ?? {};

    return {
      locale,
      namespace,
      messages,
    };
  };
}
