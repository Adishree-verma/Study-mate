import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, User, ExternalLink, Loader2, MessageSquare, Trash2, Globe } from "lucide-react";
// Globe is still used for source link labels
import { useToast } from "@/hooks/use-toast";

interface Source {
  title: string;
  url: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Explain Newton's laws of motion with examples",
  "How do I solve quadratic equations step by step?",
  "What is the difference between mitosis and meiosis?",
  "Explain the concept of limits in calculus",
  "What are the main topics in JEE Advanced chemistry?",
  "How to improve concentration while studying?",
];

function formatAnswer(text: string) {
  // Convert markdown-like formatting into styled JSX
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("### ")) {
      return <h3 key={i} className="text-sm font-bold mt-3 mb-1">{line.slice(4)}</h3>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={i} className="text-base font-bold mt-3 mb-1">{line.slice(3)}</h2>;
    }
    if (line.startsWith("# ")) {
      return <h1 key={i} className="text-base font-bold mt-3 mb-1">{line.slice(2)}</h1>;
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\d+\.\s/)) {
      return <p key={i} className="text-sm ml-3">{line}</p>;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <p key={i} className="text-sm ml-3">• {line.slice(2)}</p>;
    }
    if (line.trim() === "") {
      return <div key={i} className="h-1.5" />;
    }
    // Handle inline bold (**text**)
    if (line.includes("**")) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-sm leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    }
    return <p key={i} className="text-sm leading-relaxed">{line}</p>;
  });
}

export default function AssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await apiRequest("POST", "/api/assistant", {
        question: question.trim(),
        history,
      });
      const data = await res.json() as { answer: string; sources: Source[] };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Could not get a response",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      // Remove the user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 p-5 text-white shadow-md shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block shrink-0">
              <DoodleIllustration type="brain" className="w-28 h-22 opacity-80" primaryColor="#ffffff" secondaryColor="#a7f3d0" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-teal-200" />
                <span className="text-xs font-medium text-teal-100">Powered by AI — JEE · NEET · Board Exams</span>
              </div>
              <h1 className="text-2xl font-bold">AI Study Assistant</h1>
              <p className="text-teal-100 text-sm mt-0.5">
                Ask anything — concepts, problems, exam tips, resources
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 shrink-0"
              onClick={clearChat}
              data-testid="button-clear-chat"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          /* Welcome / Empty State */
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="text-center">
              <DoodleIllustration type="student" className="w-44 h-36 mx-auto" primaryColor="#0d9488" secondaryColor="#99f6e4" />
              <h2 className="text-lg font-bold mt-4">Ask me anything!</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Get detailed, step-by-step help on any topic — Physics, Chemistry, Maths, Biology, and exam strategy.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">Try asking</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-left text-sm rounded-xl border border-border bg-background px-3.5 py-2.5 hover-elevate transition-all"
                    data-testid={`suggestion-${i}`}
                  >
                    <MessageSquare className="inline h-3.5 w-3.5 mr-2 text-teal-500" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              data-testid={`message-${message.role}-${message.id}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-br from-teal-400 to-cyan-500"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600"
              }`}>
                {message.role === "user"
                  ? <User className="h-4 w-4 text-white" />
                  : <Bot className="h-4 w-4 text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                {message.role === "user" ? (
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-teal-500 to-cyan-600 px-4 py-2.5 text-white shadow-sm">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <Card className="rounded-2xl rounded-tl-sm shadow-sm border-indigo-100 dark:border-indigo-900/40 max-w-full">
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                        {formatAnswer(message.content)}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />Sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, i) => (
                              <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs hover-elevate transition-all"
                                data-testid={`source-link-${i}`}
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[18ch]">{source.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <span className="text-xs text-muted-foreground px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Loading bubble */}
        {isLoading && (
          <div className="flex gap-3" data-testid="loading-indicator">
            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <Card className="rounded-2xl rounded-tl-sm shadow-sm border-indigo-100 dark:border-indigo-900/40">
              <CardContent className="p-4 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">Thinking through your question...</div>
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <div
                        key={delay}
                        className="h-2 w-2 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 border-t bg-background p-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question about Physics, Chemistry, Math, Biology..."
              className="resize-none pr-2 min-h-[48px] max-h-32"
              rows={1}
              disabled={isLoading}
              data-testid="input-question"
            />
            <p className="text-xs text-muted-foreground mt-1 ml-1">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white shrink-0 mb-5"
            size="default"
            data-testid="button-send"
          >
            {isLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
