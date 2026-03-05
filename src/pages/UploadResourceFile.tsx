import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const UploadResourceFile = () => {
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const uploadPDF = async () => {
    setUploading(true);
    setPublicUrl(null);

    try {
      // Fetch the PDF file
      const response = await fetch("/resources/Sentinel_DeFi_Awareness_Mini_Guide.pdf");
      if (!response.ok) {
        throw new Error("Failed to fetch the PDF file");
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);


      // Call the edge function to upload to Supabase storage
      const { data, error } = await supabase.functions.invoke("upload-resource-file", {
        body: {
          fileName: "Sentinel_DeFi_Awareness_Mini_Guide.pdf",
          fileData: base64Data,
        },
      });

      if (error) throw error;

      if (data.success) {
        setPublicUrl(data.publicUrl);
        toast.success("PDF uploaded successfully!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Resource File to Supabase</CardTitle>
          <CardDescription>
            Upload Sentinel_DeFi_Awareness_Mini_Guide.pdf to Supabase storage and generate a permanent public URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              File: <strong>Sentinel_DeFi_Awareness_Mini_Guide.pdf</strong>
              <br />
              Destination: Supabase Storage (resources bucket)
              <br />
              Access: Public, permanent URL
            </AlertDescription>
          </Alert>

          <Button
            onClick={uploadPDF}
            disabled={uploading || !!publicUrl}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>Uploading...</>
            ) : publicUrl ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to Supabase Storage
              </>
            )}
          </Button>

          {publicUrl && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Public URL (Permanent):</p>
                <div className="flex items-start gap-2 p-3 bg-background rounded border">
                  <code className="text-xs break-all flex-1">{publicUrl}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("URL copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publicUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test Link
                </Button>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ✅ This URL is permanent and can be used in your email funnel.
                  <br />
                  ✅ The file is publicly accessible and will not expire.
                  <br />
                  ✅ You can now insert this link into Email #2 and Email #3.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadResourceFile;
