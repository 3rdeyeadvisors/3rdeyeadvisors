import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KeyTakeaway } from './KeyTakeaway';
import { DidYouKnow } from './DidYouKnow';
import { StepBlock } from './StepBlock';
import { FlipCard } from './FlipCard';
import { ComparisonTable } from './ComparisonTable';
import { TermDefinition } from './TermDefinition';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  content: string;
  heroImage?: string;
}

export const EnhancedMarkdownRenderer = ({ content, heroImage }: EnhancedMarkdownRendererProps) => {
  // Parse custom components from the markdown
  const renderContent = () => {
    const parts = content.split(/(\[COMPONENT:.*?\].*?\[\/COMPONENT\])/gs);
    
    return parts.map((part, index) => {
      // Check if this is a component marker
      const componentMatch = part.match(/\[COMPONENT:(.*?)\](.*?)\[\/COMPONENT\]/s);
      
      if (componentMatch) {
        const [, componentType, componentContent] = componentMatch;
        
        try {
          const data = JSON.parse(componentContent);
          
          switch (componentType) {
            case 'KEY_TAKEAWAY':
              return (
                <div key={index} className="my-6">
                  <KeyTakeaway title={data.title}>
                    {data.content}
                  </KeyTakeaway>
                </div>
              );
              
            case 'DID_YOU_KNOW':
              return (
                <div key={index} className="my-6">
                  <DidYouKnow fact={data.fact} />
                </div>
              );
              
            case 'STEP_BLOCK':
              return (
                <div key={index} className="my-6">
                  <StepBlock steps={data.steps} title={data.title} />
                </div>
              );
              
            case 'FLIP_CARDS':
              return (
                <div key={index} className="my-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.cards.map((card: { front: string; back: string }, cardIndex: number) => (
                    <FlipCard key={cardIndex} front={card.front} back={card.back} />
                  ))}
                </div>
              );
              
            case 'COMPARISON_TABLE':
              return (
                <div key={index} className="my-6">
                  <ComparisonTable
                    title={data.title}
                    items={data.items}
                  />
                </div>
              );
              
            case 'DEFINITION':
              return (
                <TermDefinition
                  key={index}
                  term={data.term || data.word}
                  definition={data.definition}
                />
              );

            case 'ALERT':
              const icons = {
                warning: AlertTriangle,
                info: Info,
                success: CheckCircle
              };
              const Icon = icons[data.type as keyof typeof icons] || Info;
              
              const cardVariant = data.type === 'warning' ? 'border-destructive/50 bg-destructive/10' : 
                                  data.type === 'success' ? 'border-awareness/50 bg-awareness/10' : 
                                  'border-accent/50 bg-accent/10';
              
              const iconColor = data.type === 'warning' ? 'text-destructive' :
                               data.type === 'success' ? 'text-awareness' :
                               'text-accent';
              
              return (
                <div key={index} className="my-6">
                  <Card className={`${cardVariant} w-full`}>
                    <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
                        <p className="text-foreground text-sm sm:text-base break-words leading-relaxed w-full">{data.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
              
            default:
              return null;
          }
        } catch (e) {
          console.error('Error parsing component:', e);
          return null;
        }
      }
      
      // Regular markdown content
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl md:text-4xl font-consciousness font-bold text-foreground mb-3 mt-8 break-words" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl md:text-3xl font-consciousness font-semibold text-foreground mb-3 mt-6 break-words" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl md:text-2xl font-consciousness font-semibold text-foreground mb-3 mt-4 break-words" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg md:text-xl font-consciousness font-medium text-foreground mb-3 mt-3 break-words" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-base text-foreground mb-4 leading-relaxed font-system break-words" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc mb-4 space-y-1 text-foreground pl-5" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal mb-4 space-y-1 text-foreground pl-5" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-base leading-relaxed font-system break-words" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <Card className="my-4 border-l-4 border-primary">
                <CardContent className="p-4">
                  <blockquote className="text-muted-foreground italic" {...props} />
                </CardContent>
              </Card>
            ),
            code: ({ node, inline, ...props }: any) => 
              inline ? (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />
              ) : (
                <code className="block bg-muted p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm" {...props} />
              ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-primary" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-accent" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-primary hover:text-primary/80 underline" {...props} />
            ),
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className="prose prose-invert max-w-none px-4 py-4 sm:px-6 space-y-4">
      {heroImage && (
        <div className="w-full mb-8 rounded-lg overflow-hidden -mx-4 sm:-mx-6">
          <img 
            src={heroImage} 
            alt="Course module hero content"
            className="w-full h-auto object-cover max-h-[400px]"
            width={1200}
            height={400}
            loading="eager"
          />
        </div>
      )}
      {renderContent()}
    </div>
  );
};
