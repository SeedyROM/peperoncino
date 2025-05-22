import { useCallback } from "react";
import { toast } from "react-hot-toast";

import useLocalStorage from "./useLocalStorage";

export default function useSessionHistory() {
  const [sessionHistory, setSessionHistory] = useLocalStorage(
    "sessionHistory",
    []
  );

  const addSessionRecord = useCallback(
    (task, plannedDuration, actualDuration) => {
      const sessionRecord = {
        id: Date.now(),
        task,
        plannedDuration,
        actualDuration: Math.ceil(actualDuration / 60), // Convert to minutes
        completedAt: new Date().toISOString(),
        date: new Date().toDateString(),
      };

      setSessionHistory((prev) => [sessionRecord, ...prev]);
      return sessionRecord;
    },
    [setSessionHistory]
  );

  const clearHistory = useCallback(() => {
    setSessionHistory([]);
  }, [setSessionHistory]);

  const exportHistoryAsCSV = useCallback(() => {
    if (sessionHistory.length === 0) {
      toast("No session history to export!", { icon: "🚫" });
      return;
    }

    const csvHeader =
      "Task,Planned Duration (min),Actual Duration (min),Date,Time\n";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvHeader +
      sessionHistory
        .map((session) => {
          return `${session.task},${session.plannedDuration},${
            session.actualDuration
          },${new Date(session.completedAt).toLocaleDateString()},${new Date(
            session.completedAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
        })
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `session_history-${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Session history exported as CSV!", { icon: "📥" });
  }, [sessionHistory]);

  const getAverageSessionDuration = useCallback(() => {
    if (sessionHistory.length === 0) return null;

    const recentSessions = sessionHistory.slice(0, 5);
    return Math.round(
      recentSessions.reduce((acc, s) => acc + s.actualDuration, 0) /
        recentSessions.length
    );
  }, [sessionHistory]);

  return {
    sessionHistory,
    addSessionRecord,
    clearHistory,
    exportHistoryAsCSV,
    getAverageSessionDuration,
  };
}
