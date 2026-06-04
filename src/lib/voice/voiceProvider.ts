// Voice provider abstraction so we can swap the implementation later (e.g., Azure Speech Services).
export type VoiceProvider = {
  // Convert speech to text.
  recognizeOnce: (options?: { languageCode?: string }) => Promise<string>;
  // Speak text aloud to the user (optional).
  speak?: (text: string, options?: { languageCode?: string }) => Promise<void>;
};

