'use server';

import { suggestTaskTitle as suggestTaskTitleFlow } from '@/ai/flows/suggest-task-title';

export async function suggestTaskTitle(description: string): Promise<string> {
  if (!description) {
    return '';
  }
  try {
    const result = await suggestTaskTitleFlow({ description });
    return result.titleSuggestion;
  } catch (error) {
    console.error('Error suggesting task title:', error);
    return '';
  }
}
