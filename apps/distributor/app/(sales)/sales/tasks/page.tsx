import { TasksClient } from "./tasks-client";
import { fetchMockTasks } from "@/lib/mock/server-actions";

export default async function SalesTasksPage() {
  const tasks = await fetchMockTasks();

  return <TasksClient initialTasks={tasks} />;
}
