import type { SurveyAnswer, SurveyAssignment, SurveyTemplate } from "./types";
import { surveyAssignments, surveyTemplates } from "./mock-data";
import { cloneSurveyAnswer, cloneSurveyAssignment, cloneSurveyTemplate } from "./serializers";

function findSurveyAssignmentRecord(assignmentId: string) {
  return surveyAssignments.find((assignment) => assignment.id === assignmentId);
}

function findSurveyTemplateRecord(templateId: string) {
  return surveyTemplates.find((template) => template.id === templateId);
}

function upsertSurveyAnswers(
  assignment: SurveyAssignment,
  answers: SurveyAnswer[],
) {
  assignment.answers = answers.map((answer) => cloneSurveyAnswer(answer));
  assignment.updatedAt = new Date().toISOString();
}

export async function getSurveyTemplates(): Promise<SurveyTemplate[]> {
  return surveyTemplates.map((template) => cloneSurveyTemplate(template));
}

export async function getSurveyTemplateById(
  templateId: string,
): Promise<SurveyTemplate | undefined> {
  const template = findSurveyTemplateRecord(templateId);
  return template ? cloneSurveyTemplate(template) : undefined;
}

export async function getSurveyAssignmentsByUser(
  userId: string,
): Promise<SurveyAssignment[]> {
  return surveyAssignments
    .filter((assignment) => assignment.userId === userId)
    .map((assignment) => cloneSurveyAssignment(assignment));
}

export async function getSurveyAssignmentById(
  assignmentId: string,
): Promise<SurveyAssignment | undefined> {
  const assignment = findSurveyAssignmentRecord(assignmentId);
  return assignment ? cloneSurveyAssignment(assignment) : undefined;
}

export async function saveSurveyAssignmentDraft(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<SurveyAssignment> {
  const assignment = findSurveyAssignmentRecord(assignmentId);

  if (!assignment) {
    throw new Error("问卷不存在");
  }

  if (assignment.userId !== userId) {
    throw new Error("无权访问该问卷");
  }

  upsertSurveyAnswers(assignment, answers);

  if (assignment.status !== "submitted") {
    assignment.status = "pending";
    assignment.submittedAt = undefined;
  }

  return cloneSurveyAssignment(assignment);
}

export async function submitSurveyAssignment(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<SurveyAssignment> {
  const assignment = findSurveyAssignmentRecord(assignmentId);

  if (!assignment) {
    throw new Error("问卷不存在");
  }

  if (assignment.userId !== userId) {
    throw new Error("无权访问该问卷");
  }

  upsertSurveyAnswers(assignment, answers);
  assignment.status = "submitted";
  assignment.submittedAt = new Date().toISOString();

  return cloneSurveyAssignment(assignment);
}
