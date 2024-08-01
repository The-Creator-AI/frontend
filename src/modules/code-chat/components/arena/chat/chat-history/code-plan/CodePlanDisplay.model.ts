import { useState } from "react";
import { CodePlanDisplayProps } from "./CodePlanDisplay.types";
import {
  handleCopy,
  updatePlanInChat,
} from "./CodePlanDisplay.utils";

export const useCodePlanDisplay = (
  plan: CodePlanDisplayProps["plan"],
  chatId: number,
  messageId: string
) => {
  const [newStepType, setNewStepType] = useState<"code" | "command" | null>(
    null
  );

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(plan.code_plan);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updatePlanInChat(chatId, messageId, {
      ...plan,
      code_plan: items,
    });
  };

  const handleDeleteStep = (index: number) => {
    const newPlan = { ...plan };
    newPlan.code_plan.splice(index, 1);
    updatePlanInChat(chatId, messageId, newPlan);
  };

  const handleAddNewStep = (type: "code" | "command", value: string) => {
    const newStep =
      type === "code"
        ? { filename: value, recommendations: [] }
        : { command: value, description: "" };
    updatePlanInChat(chatId, messageId, {
      ...plan,
      code_plan: [...plan.code_plan, newStep],
    });
    setNewStepType(null);
  };

  return {
    newStepType,
    handleOnDragEnd,
    setNewStepType,
    handleDeleteStep,
    handleCopy,
    handleAddNewStep,
  };
};
