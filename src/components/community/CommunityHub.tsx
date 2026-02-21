import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Comments } from "./Comments";
import { RatingReviews } from "./RatingReviews";
import { QADiscussions } from "./QADiscussions";
import { MessageCircle, Star, HelpCircle, Users } from "lucide-react";

interface CommunityHubProps {
  contentType: 'tutorial' | 'course' | 'module';
  contentId: string;
  title?: string;
  showDiscussions?: boolean;
}

export const CommunityHub = ({ 
  contentType, 
  contentId, 
  title, 
  showDiscussions = true 
}: CommunityHubProps) => {
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6 py-5">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl mb-2">
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>Community Hub</span>
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Connect with other learners, share feedback, and get help
          </CardDescription>
          {/* Softer notice for mobile users */}
          <div className="text-center py-3 px-4 mt-4 bg-white/5 rounded-lg border border-white/8 md:hidden">
            <p className="text-xs text-white/50 leading-relaxed">
              Fully usable on mobile. For the best experience, we recommend using a desktop or laptop.
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-5">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="flex flex-wrap gap-3 w-full justify-center p-3 bg-black/60 rounded-lg border border-white/8 mb-8">
              <TabsTrigger 
                value="comments" 
                className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>Comments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ratings" 
                className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
              >
                <Star className="w-4 h-4 flex-shrink-0" />
                <span>Ratings</span>
              </TabsTrigger>
              {showDiscussions && (
                <TabsTrigger 
                  value="discussions" 
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-md text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Q&A</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="comments" className="mt-6 space-y-4">
              <Comments 
                contentType={contentType}
                contentId={contentId}
                title={title}
              />
            </TabsContent>
            
            <TabsContent value="ratings" className="mt-6 space-y-4">
              {(contentType === 'tutorial' || contentType === 'course') ? (
                <RatingReviews 
                  contentType={contentType}
                  contentId={contentId}
                  title={title}
                />
              ) : (
                <div className="text-center py-8 text-white/50 text-sm">
                  Ratings are available for tutorials and courses
                </div>
              )}
            </TabsContent>
            
            {showDiscussions && (
              <TabsContent value="discussions" className="mt-6 space-y-4">
                <QADiscussions 
                  contentType={contentType === 'module' ? 'tutorial' : contentType}
                  contentId={contentId}
                  title={title}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};