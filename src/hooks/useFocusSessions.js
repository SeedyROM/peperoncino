import { useCallback } from "react";

import useLocalStorage from "./useLocalStorage";
import toast from "react-hot-toast";

export default function useFocusSessions() {
  const [focusSessions, setFocusSessions] = useLocalStorage(
    "focusSessions",
    []
  );

  const addTask = useCallback(
    (taskText, length, priority = "medium") => {
      if (taskText.trim()) {
        console.log("length", length);
        const newTask = {
          id: Date.now(),
          task: taskText.trim(),
          completed: false,
          priority,
          length,
        };
        setFocusSessions((prev) => [...prev, newTask]);
        return newTask;
      }
    },
    [setFocusSessions]
  );

  const toggleComplete = useCallback(
    (id) => {
      setFocusSessions((prev) =>
        prev.map((session) =>
          session.id === id
            ? { ...session, completed: !session.completed }
            : session
        )
      );
    },
    [setFocusSessions]
  );

  const removeTask = useCallback(
    (id) => {
      setFocusSessions((prev) => prev.filter((session) => session.id !== id));
      toast("Task removed", { icon: "❌" });
    },
    [setFocusSessions]
  );

  const setPriority = useCallback(
    (id, priority) => {
      setFocusSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, priority } : session
        )
      );
    },
    [setFocusSessions]
  );

  const markTaskCompleted = useCallback(
    (id) => {
      setFocusSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, completed: true } : session
        )
      );
    },
    [setFocusSessions]
  );

  return {
    focusSessions,
    addTask,
    toggleComplete,
    removeTask,
    setPriority,
    markTaskCompleted,
  };
}
