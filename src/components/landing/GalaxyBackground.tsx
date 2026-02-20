import React from 'react';

const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* Base black */}
      <div className="absolute inset-0 bg-black" />

      {/* Nebula blobs */}
      <div className="absolute top-0 left-0 w-[80vw] h-[80vh] rounded-full bg-blue-500/10 blur-[140px] -translate-x-1/2 -translate-y-1/2 animate-nebula-1" />
      <div className="absolute bottom-0 right-0 w-[70vw] h-[70vh] rounded-full bg-violet-500/12 blur-[120px] translate-x-1/4 translate-y-1/4 animate-nebula-2" />
      <div className="absolute top-1/2 left-1/2 w-[50vw] h-[50vh] rounded-full bg-indigo-700/6 blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-nebula-3" />

      {/* Star layers */}
      <div className="stars-layer-1 absolute inset-0 animate-drift-1" />
      <div className="stars-layer-2 absolute inset-0 animate-drift-2" />
      <div className="stars-layer-3 absolute inset-0 animate-drift-3" />
    </div>
  );
};

export default GalaxyBackground;
