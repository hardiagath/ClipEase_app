"use server";

import {
  suggestRelevantSnippets,
  type SuggestRelevantSnippetsInput,
} from "@/ai/flows/suggest-relevant-snippets";

export async function getSuggestions(input: SuggestRelevantSnippetsInput) {
  try {
    const result = await suggestRelevantSnippets(input);
    return { success: true, data: result.suggestedSnippets };
  } catch (error: any) {
    console.error("Error getting AI suggestions:", error);
    return { success: false, error: error.message || "Failed to get suggestions." };
  }
}
