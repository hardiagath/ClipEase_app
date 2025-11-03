'use server';

/**
 * @fileOverview A flow that suggests relevant snippets based on the current context.
 *
 * - suggestRelevantSnippets - A function that suggests relevant snippets.
 * - SuggestRelevantSnippetsInput - The input type for the suggestRelevantSnippets function.
 * - SuggestRelevantSnippetsOutput - The return type for the suggestRelevantSnippets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantSnippetsInputSchema = z.object({
  currentApplication: z.string().describe('The name of the currently active application.'),
  currentText: z.string().describe('The text the user is currently typing.'),
  clipboardHistory: z.array(z.string()).describe('The recent clipboard history.'),
  savedSnippets: z.array(z.string()).describe('The user saved snippets.'),
});
export type SuggestRelevantSnippetsInput = z.infer<typeof SuggestRelevantSnippetsInputSchema>;

const SuggestRelevantSnippetsOutputSchema = z.object({
  suggestedSnippets: z.array(z.string()).describe('The snippets suggested to the user.'),
});
export type SuggestRelevantSnippetsOutput = z.infer<typeof SuggestRelevantSnippetsOutputSchema>;

export async function suggestRelevantSnippets(input: SuggestRelevantSnippetsInput): Promise<SuggestRelevantSnippetsOutput> {
  return suggestRelevantSnippetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantSnippetsPrompt',
  input: {schema: SuggestRelevantSnippetsInputSchema},
  output: {schema: SuggestRelevantSnippetsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant snippets to the user based on their current context.

  The current application the user is using is: {{{currentApplication}}}
  The text the user is currently typing is: {{{currentText}}}
  The user's recent clipboard history is: {{#each clipboardHistory}}{{{this}}}\n{{/each}}
  The user's saved snippets are: {{#each savedSnippets}}{{{this}}}\n{{/each}}

  Suggest the most relevant snippets to the user, taking into account the current application, the text the user is typing, and the user's recent clipboard history. Only suggest snippets that are highly relevant to the current context.

  Make sure that suggestedSnippets values are copied from the user saved snippets.
  Return an array of strings.
  `,
});

const suggestRelevantSnippetsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantSnippetsFlow',
    inputSchema: SuggestRelevantSnippetsInputSchema,
    outputSchema: SuggestRelevantSnippetsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
