import { AgentType } from "@The-Creator-AI/fe-be-common/dist/types";
import { CodeChatActions } from "../code-chat.actions";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
  getChatById,
} from "../code-chat.store";
import * as Modals from "../../components/modals";

export const updateOpenModals = (modals: CodeChatStoreState["openModals"]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      openModals: modals,
    },
    CodeChatActions.UPDATE_OPEN_MODALS
  );
};

export const openModal = <T extends keyof typeof Modals>(
  modal: T,
  props?: Parameters<(typeof Modals)[T]>[0]
) => {
  const openModals = codeChatStoreStateSubject.getValue().openModals;
  if (openModals.find((m) => m.type === modal)) {
    return;
  }
  updateOpenModals([
    ...openModals,
    {
      type: modal,
      props: props,
    },
  ]);
};

export const closeModal = <T extends keyof typeof Modals>(modal: T) => {
  const openModals = codeChatStoreStateSubject.getValue().openModals;
  if (!openModals.find((m) => m.type === modal)) {
    return;
  }
  updateOpenModals(openModals.filter((m) => m.type !== modal));
};
