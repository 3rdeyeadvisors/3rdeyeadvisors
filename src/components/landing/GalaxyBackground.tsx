import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const GalaxyBackground = () => {
  // Generate stars once to avoid re-renders
  const starLayers = useMemo(() => {
    const layers = [
      { count: 150, size: 1, duration: 100, opacity: 0.3 },
      { count: 80, size: 1.5, duration: 150, opacity: 0.5 },
      { count: 40, size: 2, duration: 200, opacity: 0.7 },
    ];

    return layers.map((layer, i) => {
      const stars = Array.from({ length: layer.count }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
      }));

      return { ...layer, stars };
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Nebulae effects */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[30%] right-[15%] w-[40%] h-[40%] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Star layers */}
      {starLayers.map((layer, i) => (
        <div key={i} className="absolute inset-0">
          {layer.stars.map((star, j) => (
            <motion.div
              key={j}
              className="absolute bg-white rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [layer.opacity * 0.5, layer.opacity, layer.opacity * 0.5],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
              style={{
                top: star.top,
                left: star.left,
                width: layer.size,
                height: layer.size,
                boxShadow: `0 0 ${layer.size * 2}px rgba(255, 255, 255, 0.8)`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Deep Space Dust / Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
};

export default GalaxyBackground;
