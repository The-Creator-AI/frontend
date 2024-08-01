import { ToClient, ToServer } from "@The-Creator-AI/fe-be-common";
import { AgentType } from "@The-Creator-AI/fe-be-common/dist/types";
import { getGatewayListener } from "../../../gateway";
import { sendMessage } from "../../../gateway/store/gateway.logic";
import { updateAgents } from "../code-chat.logic";

export const fetchAgents = async () => {
  try {
    sendMessage(ToServer.GET_AGENTS, {});
  } catch (error) {
    console.error("Error fetching agents:", error);
  }
};

export const saveAgent = async (
  agent: Omit<AgentType, "id"> & { id?: number }
) => {
  try {
    sendMessage(ToServer.SAVE_AGENT, agent);
  } catch (error) {
    console.error("Error saving agent:", error);
  }
};

export const deleteAgent = async (id: number) => {
  try {
    sendMessage(ToServer.DELETE_AGENT, { id });
  } catch (error) {
    console.error("Error deleting agent:", error);
  }
};

export const onAgents = getGatewayListener(
  ToClient.AGENTS,
  (agents: AgentType[]) => {
    updateAgents(agents);
  }
);
