import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface RaffleCountdownProps {
  endDate: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const RaffleCountdown = ({ endDate }: RaffleCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="bg-primary/10 rounded-lg px-2 sm:px-4 py-2 sm:py-3 min-w-[50px] sm:min-w-[70px] text-center">
        <span className="text-lg sm:text-2xl font-bold text-primary">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] sm:text-xs text-white/50 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2">
      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <TimeBlock value={timeRemaining.days} label="Days" />
        <span className="text-lg sm:text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeRemaining.hours} label="Hours" />
        <span className="text-lg sm:text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeRemaining.minutes} label="Min" />
        <span className="text-lg sm:text-2xl font-bold text-white/50">:</span>
        <TimeBlock value={timeRemaining.seconds} label="Sec" />
      </div>
    </div>
  );
};

export default RaffleCountdown;
