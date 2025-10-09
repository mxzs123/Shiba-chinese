"use server";

import type { Task, TaskStatus } from "@shiba/models";

import {
  fetchMockTasks,
  shouldUseMock,
  updateMockTaskStatus,
} from "../../../../lib/mock/server-actions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchTasksAction(): Promise<ActionResult<Task[]>> {
  if (!shouldUseMock()) {
    return { success: false, error: "任务服务暂未接通，请使用 Mock 数据" };
  }

  const tasks = await fetchMockTasks();
  return { success: true, data: tasks };
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<ActionResult<Task>> {
  if (!taskId) {
    return { success: false, error: "任务标识无效" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "任务服务暂未接通，请使用 Mock 数据" };
  }

  const task = await updateMockTaskStatus(taskId, status);
  if (!task) {
    return { success: false, error: "任务不存在或已被移除" };
  }

  return { success: true, data: task };
}
