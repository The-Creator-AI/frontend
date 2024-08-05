import React, { useEffect, useMemo, useState } from "react";
import { codeChatStoreStateSubject } from "../../../store/code-chat.store";
import useStore from "../../../../../state/useStore";
import AgentsSettings from "./agents-settings/AgentsSettings";
import "./Settings.scss";
import { SETTINGS_ITEMS } from "../arena-sidebar/settings/Settings.section";
import { Typography } from "antd";

interface SettingsProps { }

const Settings: React.FC<SettingsProps> = () => {
    const { stage } = useStore(codeChatStoreStateSubject);
    //   const [currentPage, setCurrentPage] = useState<string>("agents");
    const currentPage = useMemo(() => {
        if (stage?.type === 'settings' && stage?.pageId) {
            return Object.values(SETTINGS_ITEMS).find((item) => item.pageId === stage.pageId);
        }
    }, [stage]);


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
            <div className="settings-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;

