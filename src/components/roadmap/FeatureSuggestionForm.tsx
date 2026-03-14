import { useState } from 'react';
import { Lightbulb, Send, Loader2, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeatureSuggestionFormProps {
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: (title: string, description: string) => Promise<boolean>;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

export const FeatureSuggestionForm = ({
  canSubmit,
  submitting,
  onSubmit
}: FeatureSuggestionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    const success = await onSubmit(title, description);
    if (success) {
      setTitle('');
      setDescription('');
      setIsOpen(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  // Non-premium users see upgrade CTA
  if (!canSubmit) {
    return (
      <Card className="border-white/8 bg-white/3 h-full">
        <CardContent className="flex flex-col items-center justify-center py-6 px-4 text-center h-full">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-white/50" />
          </div>
          <h3 className="text-base font-consciousness font-medium mb-1">Premium Feature</h3>
          <p className="text-sm text-white/50 mb-4 max-w-sm">
            Annual members can submit feature ideas for consideration.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/subscription">
              View Plans <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full flex flex-col">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex-1 flex flex-col"
      >
        <CollapsibleTrigger asChild className={cn(
          "cursor-pointer hover:bg-primary/5 transition-colors rounded-t-lg !flex !items-center !justify-center py-8",
          !isOpen ? "flex-1" : "min-h-[180px]"
        )}>
          <CardHeader>
            <div className="flex flex-col items-center justify-center text-center gap-2 w-full">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">Submit Your Feature Idea</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Share your ideas and help shape the platform
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="mt-1">
                {isOpen ? 'Close' : 'Open'}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 flex flex-col items-center">
            <div className="w-full max-w-md space-y-4 mx-auto">
              {/* Title Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between w-full text-left">
                  <label className="text-sm font-medium">Title</label>
                  <span className="text-xs text-white/50">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </span>
                </div>
                <Input
                  placeholder="Brief feature title..."
                  value={title}
                  onChange={handleTitleChange}
                  disabled={submitting}
                  className="bg-black"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between w-full text-left">
                  <label className="text-sm font-medium">Description</label>
                  <span className="text-xs text-white/50">
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <Textarea
                  placeholder="Describe your feature idea in detail..."
                  value={description}
                  onChange={handleDescriptionChange}
                  disabled={submitting}
                  rows={4}
                  className="bg-black resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !description.trim()}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Idea
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
