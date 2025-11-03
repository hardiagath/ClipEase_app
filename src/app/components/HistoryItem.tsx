"use client";

import { ClipboardItem } from "@/lib/types";
import { useAppContext } from "@/app/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Copy, Pin, PinOff, Trash2 } from "lucide-react";

interface HistoryItemProps {
  item: ClipboardItem;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const { togglePinHistoryItem, deleteHistoryItem } = useAppContext();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    toast({
      title: "Copied to clipboard!",
    });
  };

  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-4">
        <pre className="font-code text-sm whitespace-pre-wrap break-words max-h-40 overflow-y-auto rounded-sm bg-muted p-3">
          {item.content}
        </pre>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy"
            className="h-8 w-8 transform transition-transform hover:scale-110"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePinHistoryItem(item.id)}
            title={item.isPinned ? "Unpin" : "Pin"}
            className={`h-8 w-8 transform transition-transform hover:scale-110 ${item.isPinned ? "text-primary" : ""}`}
          >
            {item.isPinned ? (
              <PinOff className="h-4 w-4 fill-current" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteHistoryItem(item.id)}
            title="Delete"
            className="h-8 w-8 text-destructive transition-transform hover:scale-110 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
