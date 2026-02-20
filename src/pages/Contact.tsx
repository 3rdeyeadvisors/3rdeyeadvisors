import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Globe, Instagram } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "" // Honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTime, setSubmitTime] = useState<number>(0);
  const { toast } = useToast();

  // Track form load time for bot detection
  useState(() => {
    setSubmitTime(Date.now());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot detection: honeypot check
    if (formData.website) {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll respond within 24 hours.",
      });
      return;
    }
    
    // Bot detection: form submitted too fast (less than 3 seconds)
    const timeTaken = Date.now() - submitTime;
    if (timeTaken < 3000) {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll respond within 24 hours.",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll respond within 24 hours.",
        });
        setFormData({ name: "", email: "", subject: "", message: "", website: "" });
        setSubmitTime(Date.now());
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to Send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <SEO 
        title="Contact & About: Connect with 3rdeyeadvisors"
        description="Contact 3rdeyeadvisors for DeFi education inquiries and support. Connect with our team to join the mission of financial awakening and consciousness."
        keywords="contact 3rdeyeadvisors, DeFi education support, financial consciousness contact, crypto education inquiry"
        url="https://www.the3rdeyeadvisors.com/contact"
      />
      <div className="min-h-screen bg-black overflow-hidden relative">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Get In Touch"
          title="Talk to Us"
          subtitle="Questions about membership, institutional partnerships, or anything else. We respond to every message."
        />

        <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="p-6 md:p-8 bg-white/3 border border-white/8 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
                <div className="flex items-center mb-8">
                  <Mail className="w-6 h-6 text-violet-400 mr-3" />
                  <h2 className="text-2xl font-consciousness font-bold text-white">
                    Get in Touch
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-body text-xs uppercase tracking-widest text-white/40 mb-2 block">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Tell us about your journey, questions, or how we can help..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-4 font-medium transition-all min-h-[52px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* About & Connect */}
            <div className="space-y-8">
              {/* About Section */}
              <div className="p-8 bg-white/3 border border-white/8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <Globe className="w-6 h-6 text-violet-400 mr-3" />
                  <h2 className="text-2xl font-consciousness font-bold text-white">
                    About 3rdeyeadvisors
                  </h2>
                </div>

                <div className="space-y-4 text-white/70 font-body leading-relaxed">
                  <p>
                    We are consciousness explorers who discovered that traditional financial systems
                    were designed to keep humanity in a state of economic dependence. DeFi represents
                    more than just technology. It is a paradigm shift toward true financial sovereignty.
                  </p>

                  <p>
                    Our mission is simple: Help conscious individuals break free from programmed
                    financial limitations and step into their power as sovereign economic beings.
                    We provide education, not promises. Tools, not shortcuts. Awareness, not hype.
                  </p>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40 italic">
                      Remember: This is not financial advice.
                      This is consciousness expansion. Always do your own research.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Connect */}
              <div className="p-8 bg-white/3 border border-white/8 rounded-2xl">
                <h3 className="text-lg font-consciousness font-bold text-white mb-6">
                  Connect With Us
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-1">Email Support</p>
                    <a
                      href="mailto:info@the3rdeyeadvisors.com"
                      className="font-consciousness text-sm font-medium text-white hover:text-violet-400 transition-colors"
                    >
                      info@the3rdeyeadvisors.com
                    </a>
                  </div>

                  <div>
                    <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-1">Instagram</p>
                    <a
                      href="https://www.instagram.com/3rdeyeadvisors"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-consciousness text-sm font-medium text-white hover:text-violet-400 transition-colors"
                    >
                      @3rdeyeadvisors
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 bg-white/3 border border-white/8 rounded-2xl flex gap-4">
                <MessageSquare className="w-6 h-6 text-violet-400 shrink-0" />
                <div>
                  <h4 className="font-consciousness font-bold text-white mb-1">
                    Response Time
                  </h4>
                  <p className="text-sm text-white/50 font-body leading-relaxed">
                    We typically respond within 24 hours during weekdays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <section className="mt-20">
            <NewsletterSignup variant="cosmic" />
          </section>
        </div>
      </div>
    </>
  );
};

export default Contact;