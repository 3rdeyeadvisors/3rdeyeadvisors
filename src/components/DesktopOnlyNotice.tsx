import { Monitor } from "lucide-react";

interface DesktopOnlyNoticeProps {
  feature?: string;
}

export const DesktopOnlyNotice = ({ feature = "full functionality" }: DesktopOnlyNoticeProps) => {
  return (
    <div className="text-center py-3 px-4 mb-4 bg-white/5 rounded-lg border border-white/8">
      <p className="text-xs sm:text-sm text-white/50">
        Fully usable on mobile. For the best experience, we recommend rotating your device to landscape or using a desktop.
      </p>
    </div>
  );
};
