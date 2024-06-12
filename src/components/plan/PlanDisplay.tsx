import { Button } from "antd";
import React from "react";

import { appStore$ } from "../../state/app.store";
import useStore from "../../state/useStore";
import useChat from "../chat/useChat";
import "./PlanDisplay.scss"; // Add this line to import the stylesheet

interface PlanDisplayProps {
  plan: {
    plan_title: string;
    plan_summary: string;
    steps: {
      type: string;
      filepath?: string;
      action?: string;
      changes?: string[];
      command?: string;
      working_directory?: string;
    }[];
  };
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const { agents, selectedFiles, currentPath } = useStore(appStore$);
  const stubbedCodeAgent = agents?.find((agent) => agent.name === "Stubbed code");
  const { sendMessage } = useChat();

  const handleWriteCode = async (filePath: string) => {
    sendMessage({
      agentInstruction: stubbedCodeAgent?.systemInstructions,
      agentName: stubbedCodeAgent?.name,
      message: `Write me code for ${filePath} as per plan`,
      selectedFiles: selectedFiles.map((f) => `${currentPath}/${f.filePath}`),
    });
  };

  return (
    <div className="plan-display">
      <h2 className="plan-title">{plan.plan_title}</h2>
      <p className="plan-summary">{plan.plan_summary}</p>
      <ul className="plan-steps">
        {plan.steps?.map((step, index) => (
          <li key={index} className="plan-step">
            {step.type === "file_change" && (
              <>
                <span className="step-description">
                  {step.action} {step.filepath}
                </span>
                {(step.action === "modify" || step.action === "create") && (
                  <Button
                    type="primary"
                    onClick={() => step.filepath && handleWriteCode(step.filepath)}
                    className="write-code-button" // Add a class to the button
                  >
                    Write Code
                  </Button>
                )}
              </>
            )}
            {step.type === "command" && (
              <span className="step-description">
                {step.command} {step.working_directory && `in ${step.working_directory}`}
              </span>
            )}
            {step.changes && (
              <ul className="step-changes">
                {step.changes?.map((change, changeIndex) => (
                  <li key={changeIndex} className="change-item">
                    {change}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanDisplay;
