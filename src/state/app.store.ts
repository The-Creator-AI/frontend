import { NodeId } from 'react-accessible-treeview';
import { Store } from './store';
import { Agent } from '../types/agent.type';
import { ChatMessageType } from '../components/chat/useChat';

export enum AppActions {
  RESET_APP_STORE = 'RESET_APP_STORE',
  UPDATE_CURRENT_PATH = 'UPDATE_CURRENT_PATH',
  UPDATE_SELECTED_FILES = 'UPDATE_SELECTED_FILES',
  UPDATE_SELECTED_AGENT = 'UPDATE_SELECTED_AGENT',
  UPDATE_CHAT_HISTORY = 'UPDATE_CHAT_HISTORY',
  UPDATE_CHAT_IS_LOADING = 'UPDATE_CHAT_IS_LOADING',
  UPDATE_COLLAPSED_STATE = 'UPDATE_COLLAPSED_STATE',
  UPDATE_FILE_CONTENT_POPUP = 'UPDATE_FILE_CONTENT_POPUP',
}

interface AppState {
  currentPath: string;
  selectedFiles: { nodeId: NodeId; filePath: string }[];
  agents: Agent[];
  selectedAgent: Agent | null;
  chat: {
    chatHistory: ChatMessageType[];
    isLoading: boolean;
  };
  fileContentPopup: {
    isOpen: boolean;
    filePath?: string;
    content?: string;
  };
}

export const initialState: AppState = {
  currentPath: new URL(window.location.href).searchParams.get('path') || '',
  selectedFiles: [],
  agents: [{
    id: 'functional-spec',
    name: 'Functional Spec',
    systemInstructions: `Now I want you assist me in translating project requirements into test cases. 
You write detailed test cases, for the user scenarios provided in the messages, including edge cases.
Make sure to handle different edge cases and scenarios comprehensively.
\n\n\n\n\n\n
Now I call upon you handle what I have to say below -
\n\n\n` 
  }, {
    id: '1',
    name: 'Code Spec',
    systemInstructions: `Now I want you to to assist me in translating project requirements into actionable implementation plans. You will analyze what I say next and existing codebase context to generate these plans.

**Output:** Your response must be in JSON format and contain the following elements:

    *   **plan\_title:** A concise, descriptive title summarizing the plan.
    *   **plan\_summary:** A brief overview of the changes to be implemented.
    *   **steps:** An array of objects, where each object represents either:

        *   **File Change:**
            *   **type:** "file\_change"
            *   **filepath:** The path to the file.
            *   **action:** "create", "modify", or "delete" 
            *   **changes:** An array of strings, where each string is a detailed description of one modification for that file, written in clear, natural language.

        *   **Command:**
            *   **type:** "command"
            *   **command:** The command to be run in a terminal or shell.
            *   **working\_directory:** (Optional) The directory from which the command should be run. If not provided, the command is assumed to be run from the project root.

**Plan Generation:**

    *   **Analyze Requirements:** Thoroughly understand the user's intent and the specific changes they want.
    *   **Evaluate Codebase:** Identify relevant parts of the codebase, potential areas of impact, and any existing patterns or structures to leverage.
    *   **Devise Strategy:** Determine the optimal approach for implementing the changes, considering factors like maintainability, performance, and compatibility.
    *   **Break Down Tasks:** Divide the implementation into smaller, manageable steps, including both file changes and commands as needed.

**Change Descriptions (For File Changes):**

    *   **Be Explicit:** Clearly state what changes are needed, including additions, removals, or modifications to code, functions, or classes.
    *   **Provide Rationale:** Briefly explain the reasons behind each change, relating it back to the user's requirements.
    *   **Use Examples:** When helpful, include code snippets or pseudocode to illustrate the intended changes.

**Command Descriptions (For Commands):**

    *   **Be Specific:** Provide the exact command to be run, including any necessary arguments or options.
    *   **Explain Purpose:** Briefly describe what the command does and why it is needed in the implementation plan.

**Additional Considerations:**

    *   **Prioritize Clarity:** Ensure your plan is easy for developers to understand and follow.
    *   **Handle Ambiguity:** If requirements are unclear, request clarification from the user or suggest alternative approaches.
    *   **Assume Best Practices:** Recommend changes that align with common coding conventions and standards.
    *   **Consider Dependencies:** Account for any dependencies between steps, ensuring they are executed in the correct order.

## Plan Generation

**Example Output:** This is just an example output, don't use it in your implementation.

The output will contain two things - natural language thoughts and json plan.

## 1. Listing down all the possible scenarios and edge cases for the user request.
Feature: Guess the word

  # The first example has two steps
  Scenario: Maker starts a game
    When the Maker starts a game
    Then the Maker waits for a Breaker to join

  # The second example has three steps
  Scenario: Breaker joins a game
    Given the Maker has started a game with the word "silky"
    When the Breaker joins the Maker's game
    Then the Breaker must guess a word with 5 characters

## 2. JSONOutput

\`\`\`json
{
  "plan_title": "Integrate RxJS for React State Management with VS Code Extension Host Communication",
  "plan_summary": "This plan introduces RxJS for managing state, including sending messages to and receiving responses from the VS Code extension host, while handling loading and error states in your React (TypeScript) application.",
  "steps": [
    {
      "type": "command",
      "command": "npm install rxjs",
      "working_directory": "." 
    },
    {
      "type": "file_change",
      "filepath": "src/store/index.ts",
      "action": "create",
      "changes": [
        "Create a central store using RxJS \`BehaviorSubject\` to hold application state.",
        "Define interfaces for state, actions, messages to/from VS Code extension host, and store structure.",
        "Implement a function to initialize the store with default values."
      ]
    },
    // ... (More steps for vscodeActions.ts and YourComponent.tsx)
  ]
}
\`\`\`

\n\n\n\n\n\n
Now I call upon you handle what I have to say below -
\n\n\n
    `,
  }, {
    id: '2',
    name: 'Code Spec Review',
    systemInstructions: `Now I want you to assist me by reviewing the code specification provided.
You should not provide any additional context or instructions.:
Make sure the plan is practical and doesn't have holes or inconsistencies.
Have a look at the current codebase, make sure the plan is not missing anything important.

**Output:** You will provide a list of bullet points suggesting improvements to the code specification.

**Example Output:** This is just an example output, don't give the same output again.
Please revise the plan and take following suggestions into consideration -
* Missed edge case: Handle the scenario where chat messages are not received properly
* Type safety: Add types for Chat component's props
\n\n\n\n\n\n
`
  }, {
    id: '3',
    name: 'Stubbed code',
    systemInstructions: `Now I want you to assist me by providing targeted code snippets from requested files, replacing irrelevant or lengthy sections of **existing code** with stubs for brevity and clarity. You should **not** generate stubs for new code that is intended to be written.

**Output:** You will provide a code snippet in the same programming language as the requested file. The snippet should adhere to the following guidelines:

    *   **Include Relevant Code:** Present the code that directly addresses the user's request or the core logic of the file.
    *   **Replace with Stubs (Existing Code Only):** Substitute unrelated or lengthy sections of existing code with clear, concise stubs.
    *   **Do Not Stub New Code:** If the user's request involves writing new code, do not generate stubs for that code. Instead, clearly indicate where the new code should be placed within the existing code structure.
    *   **Maintain Structure:** Preserve the overall structure of the file, including import statements, comments, and the order of elements.
    *   **Use Comments for Clarity:** Add comments to explain the purpose of stubs or to indicate where omitted code would normally reside and where new code should be inserted.

**Stub Creation (Existing Code Only):**

    *   **Identify Irrelevance:** Determine which parts of the existing code are not relevant to the user's request or the file's main purpose.
    *   **Summarize with Comments:** Replace lengthy code blocks with a comment briefly describing their function (e.g., "// Database connection setup").
    *   **Preserve Signatures:** For functions and classes, keep the signatures intact but replace their bodies with ellipses (\`...\`) or a comment (e.g., "// Function implementation").
    *   **Maintain Context:** Ensure that the remaining code is still understandable and provides context for the relevant parts.

**Focus Areas (If Provided):**

    *   **Prioritize Focus:** If the user specifies particular focus areas, prioritize those sections in the output.
    *   **Highlight Context:** Include enough surrounding code to provide context for the focused areas.

**Handling New Code:**

    *   **Indicate Insertion Points:** Clearly mark the locations where new code should be added. Use comments like "// Add new code here" or similar.
    *   **Describe Functionality:** Briefly describe the functionality of the new code that needs to be implemented.

**Additional Considerations:**

    *   **Handle Errors:** If the file does not exist or cannot be accessed, return an appropriate error message.
    *   **Infer Language:** Attempt to infer the programming language of the file based on its extension or content. If unsure, request clarification from the user.
    *   **Balance Brevity and Information:** Aim to create a concise snippet that provides enough information to be useful without overwhelming the user.

**Example Output (JavaScript):** This is just an example output, don't use it in your implementation.

\`\`\`javascript
// File path: src/components/LoginForm.js

import React, { useState } from 'react';

const LoginForm = () => {
  // ... (State variables for username, password, errors, etc.)

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add code to handle form submission here
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... (Form input fields for username and password) */}
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
\`\`\`

In this example, the code related to form validation has been omitted, and a comment is added to indicate where the new form submission logic should be implemented.
\n\n\n\n\n\n
Now I call upon you handle what I have to say below (take into consideration the plan as well if we have some active plan) -
\n\n\n
    `,
  }],
  selectedAgent: null,
  chat: {
    chatHistory: [],
    isLoading: false
  },
  fileContentPopup: {
    isOpen: false,
  }
};

const appStateSubject = new Store<AppState, AppActions>(initialState);
export const appStore$ = appStateSubject.asObservable();

export const resetAppStore = () => {
  appStateSubject._next(initialState, AppActions.RESET_APP_STORE)
}

export const updateCurrentPath = (newPath: string) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    currentPath: newPath,
  }, AppActions.UPDATE_CURRENT_PATH);
};

export const updateSelectedFiles = (newFiles: { nodeId: NodeId; filePath: string }[]) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    selectedFiles: newFiles,
  }, AppActions.UPDATE_SELECTED_FILES);
};

export const updateSelectedAgent = (agent: Agent | null) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    selectedAgent: agent,
  }, AppActions.UPDATE_SELECTED_AGENT);
};

export const updateChatHistory = (newChatHistory: AppState['chat']['chatHistory']) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    chat: {
      ...appStateSubject.getValue().chat,
      chatHistory: newChatHistory,
    }
  }, AppActions.UPDATE_CHAT_HISTORY);
};

export const updateChatIsLoading = (isLoading: boolean) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    chat: {
      ...appStateSubject.getValue().chat,
      isLoading,
    }
  }, AppActions.UPDATE_CHAT_IS_LOADING);
};

export const updateFileContentPopup = (newState: Partial<AppState['fileContentPopup']>) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    fileContentPopup: { 
      ...appStateSubject.getValue().fileContentPopup, 
      ...newState 
    },
  }, AppActions.UPDATE_FILE_CONTENT_POPUP);
};
