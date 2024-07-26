import { List, Typography } from "antd";
import React, { useMemo } from "react";
import {
    updateStage
} from "../../../../store/code-chat-store.logic";
import "./Settings.section.scss";
import useStore from "../../../../../../state/useStore";
import { codeChatStore$ } from "../../../../store/code-chat.store";

export const SETTINGS_ITEMS = {
    AGENTS: {
        title: 'Agents',
        pageId: 'agent-editor',
    }
}

interface SavedPlansProps { }

const SavedPlans: React.FC<SavedPlansProps> = () => {
    const settingsItems = useMemo(() => Object.values(SETTINGS_ITEMS), []);
    const { stage } = useStore(codeChatStore$);

    return (
        <List
            className="settings-section"
            itemLayout="horizontal"
            dataSource={settingsItems}
            renderItem={(item) => (
                <List.Item
                    className="item"
                    onClick={(e) => {
                        updateStage({ type: "settings", pageId: item.pageId });
                    }}
                >
                    <List.Item.Meta
                        title={ <Typography.Text
                            className={`title ${stage?.type === "settings" && stage.pageId === item.pageId ? "active" : ""}`}
                            title={item.title}
                        >
                            {item.title}
                        </Typography.Text>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

export default SavedPlans;
