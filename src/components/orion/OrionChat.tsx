import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import OrionAvatar from "./OrionAvatar";
import { useOrionChat } from "@/hooks/useOrionChat";

const quickActions = [
  "What is Sentinel DeFi?",
  "Show me courses",
  "How does pricing work?",
  "I'm new to DeFi",
];

const OrionChat = () => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    isOpen,
    showGreeting,
    greeting,
    sendMessage,
    openChat,
    closeChat,
    dismissGreeting,
  } = useOrionChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 md:bottom-6 md:right-6">
      {/* Greeting Bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-64 md:w-72"
          >
            <div className="relative bg-white/3 border border-white/8 rounded-2xl rounded-br-sm p-4 shadow-xl">
              <button
                onClick={dismissGreeting}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Dismiss greeting"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
              <p className="text-sm text-foreground pr-6">{greeting}</p>
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={openChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Orion
              </Button>
            </div>
            {/* Bubble pointer */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/3 border-r border-b border-white/8 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-sm md:w-96 bg-white/3 border border-white/8 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/8 bg-white/5">
              <div className="flex items-center gap-3">
                <OrionAvatar size="sm" isThinking={isLoading} />
                <div>
                  <h3 className="font-semibold text-foreground">Orion</h3>
                  <p className="text-xs text-white/50">Sentinel DeFi Assistant</p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-white/5 text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-primary/60 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary/60 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary/60 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions - show only if few messages */}
                {messages.length <= 1 && (
                  <div className="pt-2">
                    <p className="text-xs text-white/50 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleQuickAction(action)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/8 bg-white/5">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orion Avatar (always visible when not in chat) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.5 }}
          >
            <OrionAvatar
              size="md"
              onClick={openChat}
              isThinking={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrionChat;
