import { useCallback } from "react";
import { toast } from "react-hot-toast";

import useLocalStorage from "./useLocalStorage";

export default function useCurrentSession(onSessionComplete) {
  const [currentSession, setCurrentSession] = useLocalStorage(
    "currentSession",
    null
  );

  const startSession = useCallback(
    (task) => {
      setCurrentSession(task);
    },
    [setCurrentSession]
  );

  const completeSessionEarly = useCallback(
    (timeWorked, sessionLength) => {
      if (currentSession && onSessionComplete) {
        onSessionComplete(currentSession, timeWorked, sessionLength);
        setCurrentSession(null);
        toast("Task marked as complete!", { icon: "✅" });
      }
    },
    [currentSession, onSessionComplete, setCurrentSession]
  );

  const stopSession = useCallback(() => {
    setCurrentSession(null);
  }, [setCurrentSession]);

  return {
    currentSession,
    startSession,
    completeSessionEarly,
    stopSession,
  };
}
