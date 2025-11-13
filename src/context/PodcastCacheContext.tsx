import React, { createContext, useContext, useRef } from "react";

interface CacheContextValue {
  getCache: (key: string) => any;
  setCache: (key: string, value: any) => void;
}

const PodcastCacheContext = createContext<CacheContextValue | null>(null);

export const PodcastCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Record<string, any>>({});

  const getCache = (key: string) => cacheRef.current[key];
  const setCache = (key: string, value: any) => {
    cacheRef.current[key] = value;
  };

  return (
    <PodcastCacheContext.Provider value={{ getCache, setCache }}>
      {children}
    </PodcastCacheContext.Provider>
  );
};

export const usePodcastCache = () => {
  const context = useContext(PodcastCacheContext);
  if (!context) {
    return {
      getCache: () => null,
      setCache: () => {},
    };
  }
  return context;
};