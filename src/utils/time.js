export function formatTime(seconds, alwaysShowSeconds = false) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    if (alwaysShowSeconds) {
      return `${hours}h ${mins}m ${secs}s`;
    } else {
      return `${hours}h ${mins}m`;
    }
  } else {
    return `${mins}m ${secs}s`;
  }
}
