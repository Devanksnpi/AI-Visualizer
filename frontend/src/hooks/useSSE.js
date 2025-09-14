import { useState, useEffect, useRef } from 'react';

export const useSSE = (url) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
        setError('Failed to parse server data');
      }
    };

    eventSource.addEventListener('question_created', (event) => {
      try {
        const questionData = JSON.parse(event.data);
        setData({ type: 'question_created', question: questionData });
      } catch (err) {
        console.error('Error parsing question data:', err);
      }
    });

    eventSource.addEventListener('answer_created', (event) => {
      try {
        const answerData = JSON.parse(event.data);
        setData({ type: 'answer_created', answer: answerData });
      } catch (err) {
        console.error('Error parsing answer data:', err);
      }
    });

    eventSource.onerror = (event) => {
      console.error('SSE error:', event);
      setError('Connection error');
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url]);

  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return {
    data,
    isConnected,
    error,
    closeConnection
  };
};
