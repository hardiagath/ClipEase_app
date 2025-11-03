'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import type { Snippet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function SnippetForm({
  snippet,
  onSave,
  onClose,
}: {
  snippet?: Snippet;
  onSave: (data: Omit<Snippet, 'id' | 'createdAt'> | Snippet) => void;
  onClose: () => void;
}) {
  const { categories } = useAppContext();
  const [name, setName] = useState(snippet?.name || '');
  const [content, setContent] = useState(snippet?.content || '');
  const [categoryId, setCategoryId] = useState(snippet?.categoryId || categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !categoryId) return;
    onSave(snippet ? { ...snippet, name, content, categoryId } : { name, content, categoryId });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="snippet-name">Name</Label>
        <Input id="snippet-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., React Component" required />
      </div>
      <div>
        <Label htmlFor="snippet-category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="snippet-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="snippet-content">Content</Label>
        <Textarea id="snippet-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="const MyComponent = () => <div>Hello</div>;" required className="font-code min-h-[150px]" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Snippet</Button>
      </DialogFooter>
    </form>
  );
}
