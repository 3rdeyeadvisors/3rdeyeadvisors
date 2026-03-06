-- Create table to store broadcast email content
CREATE TABLE IF NOT EXISTS public.broadcast_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type TEXT NOT NULL CHECK (day_type IN ('monday', 'wednesday', 'friday')),
  subject_line TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  market_block TEXT NOT NULL,
  cta_link TEXT NOT NULL DEFAULT 'https://sentineldefi.online',
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_email_queue ENABLE ROW LEVEL SECURITY;

-- Only admins and service role can manage broadcast queue
CREATE POLICY "Only admins and service can manage broadcast queue"
ON public.broadcast_email_queue
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Create index for efficient lookups
CREATE INDEX idx_broadcast_queue_scheduled ON public.broadcast_email_queue(scheduled_for, day_type, sent_at);

-- Trigger for updated_at
CREATE TRIGGER update_broadcast_queue_updated_at
BEFORE UPDATE ON public.broadcast_email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();