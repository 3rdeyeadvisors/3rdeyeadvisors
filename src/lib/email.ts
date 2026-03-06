import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MiniGameResult {
  email: string;
  game_type: string;
  score: number;
  iq_score?: number;
  percentile?: string;
  description?: string;
}

/**
 * Utility to share mini-game or IQ test results via email.
 * Attempts to trigger a Supabase Edge Function, falling back to mailto: if needed.
 */
export const shareResultsViaEmail = async (result: MiniGameResult): Promise<boolean> => {
  try {
    // Attempt to invoke the edge function
    const { data, error } = await supabase.functions.invoke('send-mini-game-results', {
      body: result,
    });

    if (error) {
      console.warn("Edge function invocation failed, falling back to mailto:", error);
      return fallbackToMailto(result);
    }

    toast.success("Results sent successfully to your email!");
    return true;
  } catch (error) {
    console.error("Error sharing results:", error);
    return fallbackToMailto(result);
  }
};

const fallbackToMailto = (result: MiniGameResult): boolean => {
  const subject = result.game_type === 'IQ Assessment'
    ? `My IQ Assessment Result: ${result.iq_score}`
    : `My Cognitive Lab Performance: ${result.game_type}`;

  const body = `
Cognitive Lab Performance Report
-------------------------------
Exercise: ${result.game_type}
${result.iq_score ? `Estimated IQ: ${result.iq_score}` : `Score: ${result.score}`}
${result.percentile ? `Percentile: Top ${result.percentile}` : ''}

${result.description || ''}

Train your mind at: https://sentineldefi.online/mini-games
  `.trim();

  const mailtoUrl = `mailto:${result.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;

  toast.info("Opening your email client...");
  return true;
};
