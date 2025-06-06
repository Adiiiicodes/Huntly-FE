'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function QueryCounter() {
  const [count, setCount] = useState<number>(500); // Start with a default value
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Store the EventSource in a ref to prevent it from being recreated on each render
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Get the API base URL from environment variable with the correct name
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6969'; // Default to local development

  useEffect(() => {
    console.log('QueryCounter: Initializing with API base URL:', API_BASE_URL);
    
    // Only attempt to connect if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let pollingInterval: NodeJS.Timeout;

    const setupSSE = () => {
      try {
        // First, get the initial count via regular fetch
        console.log('QueryCounter: Fetching initial count...');
        setIsLoading(true);
        
        fetch(`${API_BASE_URL}/api/counter`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          // Add mode: 'cors' for cross-origin requests
          mode: 'cors'
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('QueryCounter: Initial count received:', data);
            if (data && typeof data.count === 'number') {
              setCount(data.count);
              setLastUpdated(new Date());
            }
            setIsLoading(false);
          })
          .catch(err => {
            console.error('QueryCounter: API fetch failed:', err);
            setIsLoading(false);
          });

        // Close any existing connection
        if (eventSourceRef.current) {
          console.log('QueryCounter: Closing existing SSE connection');
          eventSourceRef.current.close();
        }

        // Clear any existing polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }

        // Then try to set up SSE for real-time updates
        console.log('QueryCounter: Setting up SSE connection...');
        const sseUrl = `${API_BASE_URL}/api/counter/stream`;
        console.log('QueryCounter: SSE URL:', sseUrl);
        
        eventSourceRef.current = new EventSource(sseUrl);
        
        eventSourceRef.current.onopen = () => {
          console.log('QueryCounter: SSE connection established');
          setIsConnected(true);
          retryCount = 0; // Reset retry counter on successful connection
        };
        
        eventSourceRef.current.onmessage = (event) => {
          console.log('QueryCounter: SSE message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('QueryCounter: Parsed SSE data:', data);
            if (data && typeof data.count === 'number') {
              setCount(data.count);
              setLastUpdated(new Date());
              console.log('QueryCounter: Updated count to', data.count);
            }
          } catch (err) {
            console.error('QueryCounter: Error parsing SSE data:', err, 'Raw data:', event.data);
          }
        };
        
        eventSourceRef.current.onerror = (err) => {
          console.error('QueryCounter: SSE connection error:', err);
          
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          
          setIsConnected(false);
          
          // Only retry a limited number of times to avoid infinite loops
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`QueryCounter: Retry attempt ${retryCount}/${MAX_RETRIES}`);
            
            // Retry after a delay
            setTimeout(() => {
              setupSSE();
            }, 5000);
          } else {
            console.log('QueryCounter: Max retries reached, falling back to polling');
            
            // Even if SSE fails, periodically poll the API for updates
            pollingInterval = setInterval(() => {
              console.log('QueryCounter: Polling for updates...');
              fetch(`${API_BASE_URL}/api/counter`)
                .then(res => res.json())
                .then(data => {
                  if (data && typeof data.count === 'number') {
                    setCount(data.count);
                    setLastUpdated(new Date());
                  }
                })
                .catch(err => console.error('QueryCounter: Polling error:', err));
            }, 10000); // Poll every 10 seconds as a fallback
          }
        };
      } catch (err) {
        console.error('QueryCounter: Error setting up SSE:', err);
        setIsConnected(false);
      }
    };

    // Set up the SSE connection
    setupSSE();
    
    // Clean up on unmount
    return () => {
      console.log('QueryCounter: Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [API_BASE_URL]);

  return (
    <motion.div 
      className="bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        delay: 0.5 // Match the hero animation delay
      }}
      title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Counter'}
    >
      <div className="relative">
        <div 
          className={`absolute inset-0 bg-accent/30 rounded-full ${isConnected ? 'animate-ping' : ''} opacity-75`}
        ></div>
        <div 
          className={`relative w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent' : 'bg-gray-400'}`}
        ></div>
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