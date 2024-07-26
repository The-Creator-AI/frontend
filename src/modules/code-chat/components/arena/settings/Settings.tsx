import React, { useEffect, useMemo, useState } from "react";
import { codeChatStore$ } from "../../../store/code-chat.store";
import useStore from "../../../../../state/useStore";
import { updateStage } from "../../../store/code-chat-store.logic";
import AgentsSettings from "./agents-settings/AgentsSettings";
import "./Settings.scss";
import { SETTINGS_ITEMS } from "../arena-sidebar/settings/Settings.section";

interface SettingsProps { }

const Settings: React.FC<SettingsProps> = () => {
    const { stage } = useStore(codeChatStore$);
    //   const [currentPage, setCurrentPage] = useState<string>("agents");
    const currentPage = useMemo(() => {
        if (stage?.type === 'settings' && stage?.pageId) {
            return Object.values(SETTINGS_ITEMS).find((item) => item.pageId === stage.pageId);
        }
    }, [stage]);


    const handlePageChange = (pageId: string) => {
        updateStage({ type: "settings", pageId });
    };

    const renderContent = () => {
        switch (currentPage?.pageId) {
            case SETTINGS_ITEMS.AGENTS.pageId:
                return <AgentsSettings />;
            default:
                return null;
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-nav">
                <button
                    className={`settings-nav-item ${stage?.type === 'settings' && currentPage?.pageId === stage.pageId ? "active" : ""
                        }`}
                    onClick={() => handlePageChange("agents")}
                >
                    {currentPage?.title}
                </button>
                {/* Add more settings pages here as needed */}
            </div>
            <div className="settings-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;

