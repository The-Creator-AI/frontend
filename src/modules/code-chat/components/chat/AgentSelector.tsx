import React from 'react';
import useStore from '../../../../state/useStore';
import { codeChatStore$ } from '../../store/code-chat.store';
import './AgentSelector.scss';
import { updateSelectedAgent } from '../../store/code-chat-store.logic';

const AgentSelector: React.FC = () => {
    const { agents, selectedAgent } = useStore(codeChatStore$);

    const handleAgentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedAgentId = event.target.value;
        const agent = agents.find(agent => agent.id === selectedAgentId);
        updateSelectedAgent(agent || null);
    };

    return (
        <div className="agent-selector-container"> 
            {/* <label htmlFor="agentSelect">Choose an Agent:</label> */}
            <select id="agentSelect" value={selectedAgent?.id || ''} onChange={handleAgentChange}>
                <option value="">None</option>
                {agents?.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                        {agent.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AgentSelector;
