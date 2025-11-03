"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { ClipboardItem, Snippet, SnippetCategory, AppTheme } from "@/lib/types";

interface AppContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  
  history: ClipboardItem[];
  addHistoryItem: (content: string) => void;
  togglePinHistoryItem: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  snippets: Snippet[];
  categories: SnippetCategory[];
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void;
  updateSnippet: (snippet: Snippet) => void;
  deleteSnippet: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (category: SnippetCategory) => void;
  deleteCategory: (id: string) => void;
  getSnippetsForCategory: (categoryId: string) => Snippet[];
  
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCategories: SnippetCategory[] = [
  { id: 'general', name: 'General' },
  { id: 'code', name: 'Code Fragments' },
];

export function AppProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [theme, setTheme] = useLocalStorage<AppTheme>("clipmanager-theme", "system");
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  // Firestore collections
  const historyRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'clipboardItems') : null, [firestore, userId]);
  const snippetsRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'snippets') : null, [firestore, userId]);
  const categoriesRef = useMemoFirebase(() => userId ? collection(firestore, 'users', userId, 'categories') : null, [firestore, userId]);

  const { data: historyData } = useCollection<ClipboardItem>(historyRef);
  const { data: snippetsData } = useCollection<Snippet>(snippetsRef);
  const { data: categoriesData, isLoading: categoriesLoading } = useCollection<SnippetCategory>(categoriesRef);

  const history = historyData || [];
  const snippets = snippetsData || [];
  const categories = categoriesData || initialCategories;

  // Set up initial categories for a new user
  useEffect(() => {
    if (userId && !categoriesLoading && categoriesData && categoriesData.length === 0) {
      const generalRef = doc(firestore, 'users', userId, 'categories', 'general');
      setDocumentNonBlocking(generalRef, initialCategories[0], {});
      const codeRef = doc(firestore, 'users', userId, 'categories', 'code');
      setDocumentNonBlocking(codeRef, initialCategories[1], {});
    }
  }, [userId, firestore, categoriesData, categoriesLoading]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    root.classList.add(effectiveTheme);
  }, [theme]);

  const addHistoryItem = (content: string) => {
    if (!content || !historyRef) return;
    if (history.some(item => item.content === content)) return;
    const id = crypto.randomUUID();
    const newItem: Omit<ClipboardItem, 'id'> = {
      contentType: 'text',
      content,
      createdAt: Date.now(),
      isPinned: false,
    };
    const docRef = doc(historyRef, id);
    setDocumentNonBlocking(docRef, { ...newItem, id }, { merge: true });
  };

  const togglePinHistoryItem = (id: string) => {
    if (!userId) return;
    const item = history.find(i => i.id === id);
    if (!item) return;
    const docRef = doc(firestore, 'users', userId, 'clipboardItems', id);
    setDocumentNonBlocking(docRef, { isPinned: !item.isPinned }, { merge: true });
  };

  const deleteHistoryItem = (id: string) => {
    if (!userId) return;
    const docRef = doc(firestore, 'users', userId, 'clipboardItems', id);
    deleteDocumentNonBlocking(docRef);
  };

  const clearHistory = () => {
    history.forEach(item => {
      if (!item.isPinned) {
        deleteHistoryItem(item.id);
      }
    });
  };

  const addSnippet = (snippet: Omit<Snippet, 'id' | 'createdAt'>) => {
    if (!snippetsRef) return;
    const id = crypto.randomUUID();
    const newSnippet: Snippet = { ...snippet, id, createdAt: Date.now() };
    const docRef = doc(snippetsRef, id);
    setDocumentNonBlocking(docRef, newSnippet, { merge: true });
  };

  const updateSnippet = (updatedSnippet: Snippet) => {
    if (!userId) return;
    const docRef = doc(firestore, 'users', userId, 'snippets', updatedSnippet.id);
    setDocumentNonBlocking(docRef, updatedSnippet, { merge: true });
  };

  const deleteSnippet = (id: string) => {
    if (!userId) return;
    const docRef = doc(firestore, 'users', userId, 'snippets', id);
    deleteDocumentNonBlocking(docRef);
  };

  const addCategory = (name: string) => {
    if (!categoriesRef) return;
    const id = crypto.randomUUID();
    const newCategory: SnippetCategory = { id, name };
    const docRef = doc(categoriesRef, id);
    setDocumentNonBlocking(docRef, newCategory, { merge: true });
  };

  const updateCategory = (updatedCategory: SnippetCategory) => {
    if (!userId) return;
    const docRef = doc(firestore, 'users', userId, 'categories', updatedCategory.id);
    setDocumentNonBlocking(docRef, updatedCategory, { merge: true });
  };
  
  const deleteCategory = (id: string) => {
    if (!userId || id === 'general' || id === 'code') return;
    const docRef = doc(firestore, 'users', userId, 'categories', id);
    deleteDocumentNonBlocking(docRef);
    // Also delete snippets in that category
    snippets.forEach(s => {
      if (s.categoryId === id) {
        deleteSnippet(s.id);
      }
    });
  };

  const getSnippetsForCategory = (categoryId: string) => {
    return snippets.filter(s => s.categoryId === categoryId);
  }

  const value = {
    theme,
    setTheme,
    history,
    addHistoryItem,
    togglePinHistoryItem,
    deleteHistoryItem,
    clearHistory,
    snippets,
    categories,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addCategory,
    updateCategory,
    deleteCategory,
    getSnippetsForCategory,
    searchTerm,
    setSearchTerm,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
