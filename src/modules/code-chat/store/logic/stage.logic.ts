import { CodeChatActions } from "../code-chat.actions";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
} from "../code-chat.store";

export const updateStage = (newState: {
  stage: Partial<CodeChatStoreState["stage"]>;
  breadcrumb: Partial<CodeChatStoreState["breadcrumb"]>;
}) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      stage: {
        ...codeChatStoreStateSubject.getValue().stage,
        ...newState.stage,
      } as any,
      breadcrumb: {
        ...codeChatStoreStateSubject.getValue().breadcrumb,
        ...newState.breadcrumb,
      } as any,
    },
    CodeChatActions.UPDATE_STAGE
  );
};
