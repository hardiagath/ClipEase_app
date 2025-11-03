"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "@/app/context/AppContext";
import { HistoryItem } from "./HistoryItem";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ClipboardPaste } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ClipboardHistory() {
  const { history, addHistoryItem, clearHistory, searchTerm } = useAppContext();
  const { toast } = useToast();
  const [pasteText, setPasteText] = useState("");

  const handleAddFromPaste = () => {
    if (pasteText.trim()) {
      addHistoryItem(pasteText);
      toast({ title: "Added to history", description: "Item from text area has been added." });
      setPasteText("");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      addHistoryItem(text);
      toast({ title: "Pasted from clipboard!", description: "Item added to your history." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to paste",
        description: "Could not read from clipboard. Please check permissions.",
      });
    }
  };

  const sortedHistory = [...history].sort((a, b) => (a.isPinned === b.isPinned) ? b.createdAt - a.createdAt : a.isPinned ? -1 : 1);
  const filteredHistory = sortedHistory.filter(item => item.content.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Add to Clipboard</CardTitle>
          <CardDescription>Paste text here to add it to your history, or use the button to paste from your clipboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Textarea
              placeholder="Paste content here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="font-code"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAddFromPaste} className="w-full sm:w-auto">Add from Text Area</Button>
              <Button onClick={handlePasteFromClipboard} variant="secondary" className="w-full sm:w-auto">
                <ClipboardPaste className="mr-2 h-4 w-4" /> Paste from Clipboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>Your copied items. Pinned items stay on top.</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={history.filter(i => !i.isPinned).length === 0}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Unpinned
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all unpinned items from your history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-6 pt-0">
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredHistory.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      >
                        <HistoryItem item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center h-48">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No history items match your search." : "Your clipboard history is empty."}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {searchTerm ? "Try a different search term." : "Copy some text to get started."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Dummy Card components for compilation
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />;
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />;
const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`p-6 pt-0 ${className}`} {...props} />;
