import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentsSection } from "./CommentsSection";
import { RatingSection } from "./RatingSection";
import { QASection } from "./QASection";
import { MessageCircle, Star, HelpCircle } from "lucide-react";

interface CommunityTabsProps {
  courseId: number;
  moduleId?: string;
}

export const CommunityTabs = ({ courseId, moduleId }: CommunityTabsProps) => {
  return (
    <div className="w-full">
      {/* Softer notice for mobile users */}
      <div className="text-center py-3 px-4 mb-4 bg-white/5 rounded-lg border border-white/8 md:hidden">
        <p className="text-xs text-white/50 leading-relaxed">
          Fully usable on mobile. For the best experience, we recommend using a desktop or laptop.
        </p>
      </div>
      
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="mt-6 mb-4 flex flex-wrap justify-center w-full rounded-lg bg-card/60 border border-white/8 p-3 gap-3">
          <TabsTrigger 
            value="comments" 
            className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 min-h-[44px] text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span>Discussion</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rating" 
            className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 min-h-[44px] text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
          >
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>Rating</span>
          </TabsTrigger>
          <TabsTrigger 
            value="qa" 
            className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 min-h-[44px] text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/50 hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>Q&A</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="mt-6 space-y-4">
          <CommentsSection courseId={courseId} moduleId={moduleId} />
        </TabsContent>
        
        <TabsContent value="rating" className="mt-6 space-y-4">
          <RatingSection courseId={courseId} moduleId={moduleId} />
        </TabsContent>
        
        <TabsContent value="qa" className="mt-6 space-y-4">
          <QASection courseId={courseId} moduleId={moduleId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};