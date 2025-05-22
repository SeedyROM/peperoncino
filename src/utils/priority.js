export function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 border-red-300 text-red-800";
    case "medium":
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    case "low":
      return "bg-green-100 border-green-300 text-green-800";
    default:
      return "bg-gray-100 border-gray-300 text-gray-800";
  }
}
