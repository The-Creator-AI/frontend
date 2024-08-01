import { CodeChatActions } from "../code-chat.actions";
import { codeChatStoreStateSubject, initialState } from "../code-chat.store";

export const resetCodeChatStore = () => {
  codeChatStoreStateSubject._next(
    initialState,
    CodeChatActions.RESET_CODE_CHAT_STORE
  );
};
