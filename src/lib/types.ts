export type ClipboardItem = {
  id: string;
  contentType: 'text';
  content: string;
  createdAt: number;
  isPinned: boolean;
};

export type Snippet = {
  id:string;
  name: string;
  content: string;
  categoryId: string;
  createdAt: number;
};

export type SnippetCategory = {
  id: string;
  name: string;
};

export type AppTheme = "light" | "dark" | "system";
