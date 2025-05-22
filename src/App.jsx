import { useState } from "react";
import {
  Clock,
  Brain,
  Target,
  CheckCircle,
  Plus,
  X,
  Play,
  Pause,
  Trash2Icon,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Import custom hooks
import {
  useLocalStorage,
  useTodayCounter,
  useTimer,
  useFocusSessions,
  useSessionHistory,
  useCurrentSession,
} from "./hooks";

// Import utils
import { formatTime, getPriorityColor } from "./utils";

const FocusTimeManager = () => {
  const [sessionLength, setSessionLength] = useLocalStorage(
    "sessionLength",
    90
  );
  const [completedToday, setCompletedToday] = useTodayCounter();
  const [newTask, setNewTask] = useState("");

  // Session history hook
  const {
    sessionHistory,
    addSessionRecord,
    clearHistory,
    exportHistoryAsCSV,
    getAverageSessionDuration,
  } = useSessionHistory();

  // Focus sessions hook
  const {
    focusSessions,
    addTask,
    toggleComplete,
    removeTask,
    setPriority,
    markTaskCompleted,
  } = useFocusSessions();

  // Handle session completion
  const handleSessionComplete = (session, timeWorked, plannedDuration) => {
    markTaskCompleted(session.id);
    addSessionRecord(session.task, plannedDuration, timeWorked);
    setCompletedToday((prev) => prev + 1);
  };

  // Current session hook
  const {
    currentSession,
    startSession: startCurrentSession,
    completeSessionEarly,
    stopSession,
  } = useCurrentSession(handleSessionComplete);

  // Timer hook
  const { timeLeft, isRunning, startTimer, pauseResume, stopTimer } = useTimer(
    () => {
      if (currentSession) {
        handleSessionComplete(
          currentSession,
          sessionLength * 60,
          sessionLength
        );
        stopSession();
      }
    }
  );

  // Combined start session function
  const startSession = (task) => {
    startCurrentSession(task);
    startTimer(sessionLength * 60);
  };

  // Combined stop session function
  const handleStopSession = () => {
    stopTimer();
    stopSession();
  };

  // Handle early completion
  const handleCompleteEarly = () => {
    const timeWorked = sessionLength * 60 - timeLeft;
    completeSessionEarly(timeWorked, sessionLength);
    stopTimer();
  };

  // Add task handler
  const handleAddTask = () => {
    if (addTask(newTask)) {
      setNewTask("");
    }
  };

  // Clear today's sessions
  const clearSessionsToday = () => {
    setCompletedToday(0);
    toast("Today's sessions cleared!", { icon: "💃" });
  };

  const averageSessionDuration = getAverageSessionDuration();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2 italic mb">
          🌶️{"  "}Peperoncino
        </h1>
        <p className="text-gray-600">
          Maximize your deep work sessions when you can actually focus, use the
          Peperoncino&reg; method!
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 group">
          <div className="flex items-center mb-1 justify-between">
            <div className="flex gap-2 items-center">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Sessions Today
              </span>
            </div>
            <button
              onClick={clearSessionsToday}
              title="Clear today's session count"
              className="text-sm text-blue-600 hover:text-blue-800 hover:scale-110 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-100"
            >
              <Trash2Icon className="w-5 h-5" />
            </button>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {completedToday}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Tasks Ready</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {focusSessions.filter((s) => !s.completed).length}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Avg Session</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {averageSessionDuration ? (
              <span>{averageSessionDuration} min</span>
            ) : (
              <span className="opacity-60 italic">N/A</span>
            )}
          </div>
        </div>
      </div>

      {/* Active Session */}
      {currentSession && (
        <>
          {isRunning ? (
            <title>{`(${formatTime(timeLeft)}) - ${
              currentSession.task
            }`}</title>
          ) : (
            <title>{`(${formatTime(timeLeft)} Paused) - ${
              currentSession.task
            }`}</title>
          )}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Current Focus Session</h2>
              <div className="text-3xl font-mono font-bold">
                {formatTime(timeLeft, true)}
              </div>
            </div>
            <p className="text-blue-100 mb-4">{currentSession.task}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCompleteEarly}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
              <button
                onClick={pauseResume}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                {isRunning ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? "Pause" : "Resume"}
              </button>
              <button
                onClick={handleStopSession}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Stop
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add New Task */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Add Focus Task</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Session length:</span>
            <select
              value={sessionLength}
              onChange={(e) => setSessionLength(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              disabled={currentSession}
            >
              <option value={25}>25 min</option>
              <option value={45}>45 min</option>
              <option value={90}>90 min</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="What needs your focused attention?"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 mb-3">Focus Queue</h3>
        {focusSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No focus tasks yet. Add some deep work items above!</p>
          </div>
        ) : (
          focusSessions.map((session) => (
            <div
              key={session.id}
              className={`border rounded-lg p-4 transition-all ${
                session.completed
                  ? "bg-gray-50 opacity-60"
                  : "bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 mr-2">
                  <button
                    onClick={() => toggleComplete(session.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      session.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {session.completed && <CheckCircle className="w-3 h-3" />}
                  </button>

                  <span
                    className={`flex-1 ${
                      session.completed
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {session.task}
                  </span>

                  {!session.completed && (
                    <span className="text-sm text-gray-500 italic">
                      {sessionLength} min (est)
                    </span>
                  )}

                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                      session.priority
                    )}`}
                  >
                    {session.priority}
                  </span>
                </div>

                <div className="flex items-center gap-4 ml-2">
                  <select
                    value={session.priority}
                    onChange={(e) => setPriority(session.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  {!session.completed && !currentSession && (
                    <button
                      onClick={() => startSession(session)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}

                  <button
                    onClick={() => removeTask(session.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center  mb-4">
            <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
            <div className="flex gap-2">
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={exportHistoryAsCSV}
                className="flex items-center gap-1 bg-cyan-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessionHistory.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {session.task}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.completedAt).toLocaleDateString()} at{" "}
                    {new Date(session.completedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {session.actualDuration} min
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.actualDuration < session.plannedDuration
                      ? `${Math.round(
                          (session.actualDuration / session.plannedDuration) *
                            100
                        )}% of planned`
                      : "Full session"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">
          💡 Focus Tips for 9-5ers
        </h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>
            • Block "focus time" on your calendar so people can't book over it
          </li>
          <li>
            • Try 90-minute sessions - they align with your natural energy
            cycles
          </li>
          <li>
            • Queue up tasks during the day so you're ready for your evening
            focus time
          </li>
          <li>• Put your phone in another room during focus sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default FocusTimeManager;
