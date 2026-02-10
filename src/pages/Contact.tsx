import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Globe, Twitter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO from "@/components/SEO";

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
        title="Contact & About - Connect with 3rdeyeadvisors"
        description="Contact 3rdeyeadvisors for DeFi education inquiries and support. Connect with our team to join the mission of financial awakening and consciousness."
        keywords="contact 3rdeyeadvisors, DeFi education support, financial consciousness contact, crypto education inquiry"
        url="https://www.the3rdeyeadvisors.com/contact"
      />
      <div className="py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-consciousness font-bold text-foreground mb-4">
            Contact & About
          </h1>
          <p className="text-xl text-muted-foreground font-consciousness max-w-3xl mx-auto leading-relaxed">
            Connect with the consciousness behind 3rdeyeadvisors. We're here to support your 
            journey toward financial awakening and decentralized empowerment.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="p-8 bg-card/60 border-border">
              <div className="flex items-center justify-center mb-4 md:mb-6 text-center">
                <Mail className="hidden md:block w-6 h-6 text-primary shrink-0 mr-3" aria-hidden="true" />
                <h2 className="text-2xl font-consciousness font-bold text-foreground text-center">
                  Get in Touch
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-consciousness">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="font-consciousness"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-consciousness">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="font-consciousness"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="font-consciousness">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    className="font-consciousness"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="font-consciousness">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tell us about your journey, questions, or how we can help..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="font-consciousness resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Honeypot field - hidden from users, visible to bots */}
                <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="cosmic" 
                  className="w-full font-consciousness"
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
            </Card>
          </div>

          {/* About & Connect */}
          <div className="space-y-8">
            {/* About Section */}
            <Card className="p-8 bg-gradient-consciousness border-primary/20">
              <div className="flex items-center justify-center mb-4 md:mb-6 text-center">
                <Globe className="hidden md:block w-6 h-6 text-foreground shrink-0 mr-3 drop-shadow-sm" aria-hidden="true" />
                <h2 className="text-2xl font-consciousness font-bold text-foreground text-center">
                  About 3rdeyeadvisors
                </h2>
              </div>

              <div className="space-y-4 text-foreground/90 font-consciousness leading-relaxed text-center">
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
                
                <p>
                  Every course, tool, and resource we create comes from direct experience navigating 
                  the DeFi landscape. We've made the mistakes so you don't have to. We've discovered 
                  the strategies that actually work.
                </p>
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Remember:</strong> This is not financial advice. 
                    This is consciousness expansion. Always do your own research and never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </Card>

            {/* Social Connect */}
            <Card className="p-6 bg-card/60 border-border">
              <h3 className="text-lg font-consciousness font-semibold text-foreground mb-4 text-center">
                Connect With Us
              </h3>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-consciousness"
                  asChild
                >
                  <a href="mailto:info@the3rdeyeadvisors.com" className="flex items-center">
                    <Mail className="w-4 h-4 mr-3" />
                    info@the3rdeyeadvisors.com
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-consciousness"
                  asChild
                >
                  <a href="https://twitter.com/3rdeyeadvisors" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Twitter className="w-4 h-4 mr-3" />
                    @3rdeyeadvisors
                  </a>
                </Button>
                
              </div>
            </Card>

            {/* Response Time */}
            <Card className="p-6 bg-awareness/5 border-awareness/20">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-awareness mt-1" />
                <div>
                  <h4 className="font-consciousness font-semibold text-foreground mb-2 text-center">
                    Response Time
                  </h4>
                  <p className="text-sm text-muted-foreground font-consciousness">
                    We typically respond within 24 hours during weekdays. For urgent technical support 
                    or course-related questions, please mention "URGENT" in your subject line.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Newsletter Section */}
        <section className="mt-16">
          <NewsletterSignup variant="cosmic" />
        </section>
      </div>
    </div>
    </>
  );
};

export default Contact;