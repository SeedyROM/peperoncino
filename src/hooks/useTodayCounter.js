import { useEffect, useCallback } from "react";

import useLocalStorage from "./useLocalStorage";

export default function useTodayCounter() {
  const [completedToday, setCompletedToday] = useLocalStorage(
    "completedToday",
    0
  );
  const [lastDate, setLastDate] = useLocalStorage("completedDate", "");

  const updateCompletedToday = useCallback(
    (updater) => {
      const today = new Date().toDateString();

      if (lastDate !== today) {
        setLastDate(today);
        const newValue = typeof updater === "function" ? updater(0) : updater;
        setCompletedToday(newValue);
      } else {
        setCompletedToday(updater);
      }
    },
    [lastDate, setLastDate, setCompletedToday]
  );

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
      setCompletedToday(0);
      setLastDate(today);
    }
  }, [lastDate, setCompletedToday, setLastDate]);

  return [completedToday, updateCompletedToday];
}
