import { ToClient, ToServer } from "@The-Creator-AI/fe-be-common";
import { ChatType, PlanType } from "@The-Creator-AI/fe-be-common/dist/types";
import { getGatewayListener } from "../../../gateway";
import { sendMessage } from "../../../gateway/store/gateway.logic";
import { CodeChatActions } from "../code-chat.actions";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
} from "../code-chat.store";

export const toggleSection = (sectionId: string) => {
  const collapsedSections =
    codeChatStoreStateSubject.getValue().collapsedSections || {};
  const newCollapsedSections = {
    ...collapsedSections,
    [sectionId]: !collapsedSections[sectionId],
  };
  updateCollapsedSections(newCollapsedSections);
};
export const updateCollapsedSections = (
  newCollapsedSections: CodeChatStoreState["collapsedSections"]
) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      collapsedSections: newCollapsedSections,
    },
    CodeChatActions.UPDATE_COLLAPSED_SECTIONS
  );
};

export const updateFileTreeData = (
  fileTreeData: CodeChatStoreState["fileTreeData"]
) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      fileTreeData,
    },
    CodeChatActions.UPDATE_FILE_TREE_DATA
  );
};

export const updateSavedPlans = (plans: PlanType[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      savedPlans: plans,
    },
    CodeChatActions.UPDATE_SAVED_PLANS
  );
};

export const updateSavedChats = (chats: ChatType[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      savedChats: chats,
    },
    CodeChatActions.UPDATE_SAVED_CHATS
  );
};

export const fetchSavedChats = async () => {
  try {
    sendMessage(ToServer.GET_CHATS, {});
  } catch (error) {
    console.error("Error fetching saved chats:", error);
  }
};

export const fetchSavedPlans = async () => {
  try {
    sendMessage(ToServer.GET_PLANS, {});
  } catch (error) {
    console.error("Error fetching saved plans:", error);
  }
};

export const savePlan = async (
  plan: Omit<PlanType, "id"> & { id?: number }
) => {
  try {
    sendMessage(ToServer.SAVE_PLAN, plan);
  } catch (error) {
    console.error("Error saving plan:", error);
  }
};

export const onPlans = getGatewayListener(
  ToClient.PLANS,
  (plans: PlanType[]) => {
    updateSavedPlans(plans);
  }
);

export const deletePlan = async (id: number) => {
  try {
    sendMessage(ToServer.DELETE_PLAN, { id });
  } catch (error) {
    console.error("Error deleting plan:", error);
  }
};
