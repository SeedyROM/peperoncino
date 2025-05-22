import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";

export default function useTimer(onComplete) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Use useRef to store the latest onComplete callback without causing re-renders
  const onCompleteRef = useRef(onComplete);

  // Update the ref whenever onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && onCompleteRef.current) {
      // Only trigger completion if we were running (prevents initial 0 state trigger)
      setIsRunning(false);
      onCompleteRef.current();
      toast("Good Job!", { icon: "🎉👏" });
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]); // Remove onComplete from dependencies

  const startTimer = useCallback((duration) => {
    setTimeLeft(duration);
    setIsRunning(true);
  }, []);

  const pauseResume = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
  }, []);

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseResume,
    stopTimer,
    setTimeLeft,
  };
}
