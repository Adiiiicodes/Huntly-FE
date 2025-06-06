'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function QueryCounter() {
  const [count, setCount] = useState<number>(500); // Start with a default value
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  // Get the API base URL from environment variable or use default
  const API_BASE_URL = process.env._API_BASE_URL || 'https://7a71-114-79-138-174.ngrok-free.app';

  useEffect(() => {
    // Only attempt to connect if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    const setupSSE = () => {
      try {
        // First, get the initial count via regular fetch
        fetch(`${API_BASE_URL}/api/counter`)
          .then(res => res.json())
          .then(data => {
            if (data && typeof data.count === 'number') {
              setCount(data.count);
            }
            setIsLoading(false);
          })
          .catch(err => {
            console.log('Using fallback count - API fetch failed:', err);
            setIsLoading(false);
          });

        // Then try to set up SSE for real-time updates
        eventSource = new EventSource(`${API_BASE_URL}/api/counter/stream`);
        
        eventSource.onopen = () => {
          console.log('SSE connection established');
          setIsConnected(true);
          retryCount = 500; // Reset retry counter on successful connection
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && typeof data.count === 'number') {
              setCount(data.count);
            }
          } catch (err) {
            console.log('Error parsing SSE data:', err);
          }
        };
        
        eventSource.onerror = () => {
          // Don't log the error object as it might be empty in some browsers
          console.log('SSE connection error or closed');
          
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          setIsConnected(false);
          
          // Only retry a limited number of times to avoid infinite loops
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retry attempt ${retryCount}/${MAX_RETRIES}`);
            
            // Retry after a delay
            setTimeout(() => {
              setupSSE();
            }, 5000);
          } else {
            console.log('Max retries reached, using static counter');
          }
        };
      } catch (err) {
        console.log('Error setting up SSE:', err);
        setIsConnected(false);
      }
    };

    // Set up the SSE connection
    setupSSE();
    
    // Clean up on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [API_BASE_URL]);

  // Auto-increment the counter every few seconds if not connected to SSE
  // This provides a good user experience even if the backend is unavailable
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setCount(prev => prev + Math.floor(Math.random() * 3) + 1); // Increment by 1-3
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <motion.div 
      className="bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        delay: 0.5 // Match the hero animation delay
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-accent/30 rounded-full animate-ping opacity-75"></div>
        <div className="relative w-1.5 h-1.5 bg-accent rounded-full"></div>
      </div>
      
      <span className="text-xs font-medium">
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          <>
            <span className="font-bold text-accent">{count.toLocaleString()}</span> 
            <span className="text-[#242229]/60 text-xs"> Queries Processed</span>
          </>
        )}
      </span>
    </motion.div>
  );
}