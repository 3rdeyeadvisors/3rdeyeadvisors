import { useState, useCallback, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "orion_greeting_dismissed";
const COOLDOWN_HOURS = 24;

const getTimeOfDay = (): "morning" | "afternoon" | "evening" => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
};

const getGreeting = (timeOfDay: string): string => {
  switch (timeOfDay) {
    case "morning":
      return "Grand Rising! I'm Orion, your guide to Sentinel DeFi. How may I help you today?";
    case "afternoon":
      return "Great Afternoon! I'm Orion, your guide to Sentinel DeFi. How may I help you today?";
    default:
      return "Great Evening! I'm Orion, your guide to Sentinel DeFi. How may I help you today?";
  }
};

export const useOrionChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay);

  // Check if greeting should auto-show
  useEffect(() => {
    const checkGreetingCooldown = () => {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const hoursSince = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        if (hoursSince < COOLDOWN_HOURS) {
          return false;
        }
      }
      return true;
    };

    // Delay the greeting popup
    const timer = setTimeout(() => {
      if (checkGreetingCooldown() && !hasInitialized) {
        setShowGreeting(true);
        setHasInitialized(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasInitialized]);

  const dismissGreeting = useCallback(() => {
    setShowGreeting(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setShowGreeting(false);
    
    // Add initial greeting as first message if no messages yet
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [messages.length, greeting]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > updatedMessages.length) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev.slice(0, -1), userMessage, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orion-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            timeOfDay,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message to start
      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistantMessage(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Orion chat error:", error);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "I'm having a bit of trouble connecting right now. Please try again in a moment!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, timeOfDay]);

  return {
    messages,
    isLoading,
    isOpen,
    showGreeting,
    greeting,
    sendMessage,
    openChat,
    closeChat,
    dismissGreeting,
  };
};
