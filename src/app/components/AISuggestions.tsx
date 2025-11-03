"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/app/context/AppContext";
import { getSuggestions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Copy, Loader2 } from "lucide-react";

export function AISuggestions() {
  const { history, snippets } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [formState, setFormState] = useState({
    currentApplication: "VS Code",
    currentText: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestions([]);

    const result = await getSuggestions({
      ...formState,
      clipboardHistory: history.slice(0, 5).map(item => item.content),
      savedSnippets: snippets.map(s => `Name: ${s.name}, Content: ${s.content}`),
    });

    setLoading(false);
    if (result.success) {
      setSuggestions(result.data || []);
      toast({ title: "Suggestions generated!", description: "The AI has found some relevant snippets." });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Suggestion copied to clipboard!" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Context Analyzer</CardTitle>
            <CardDescription>
              Provide your current context, and the AI will suggest relevant snippets from your library.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentApplication">Current Application</Label>
              <Input
                id="currentApplication"
                name="currentApplication"
                value={formState.currentApplication}
                onChange={handleInputChange}
                placeholder="e.g., VS Code, Chrome"
              />
            </div>
            <div>
              <Label htmlFor="currentText">Current Text</Label>
              <Textarea
                id="currentText"
                name="currentText"
                value={formState.currentText}
                onChange={handleInputChange}
                placeholder="What are you currently writing?"
                className="min-h-[120px] font-code"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {loading ? "Analyzing..." : "Get Suggestions"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-headline font-semibold">Suggested Snippets</h3>
        {loading && (
           <div className="space-y-2">
             <Skeleton className="h-16 w-full" />
             <Skeleton className="h-16 w-full" />
           </div>
        )}
        <AnimatePresence>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative group transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <pre className="font-code text-sm whitespace-pre-wrap break-words">{suggestion}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(suggestion)}
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center h-48">
              <p className="text-muted-foreground">No suggestions yet.</p>
              <p className="text-sm text-muted-foreground/70">Fill out the form to get started.</p>
            </div>
          )
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />
);
