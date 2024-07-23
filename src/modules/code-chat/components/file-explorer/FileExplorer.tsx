import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { DraggableCore } from "react-draggable";
import config from "../../../../config";
import useStore from "../../../../state/useStore";
import {
  updateFileContentPopup
} from "../../store/code-chat-store.logic";
import { codeChatStore$ } from "../../store/code-chat.store";
import Chat from "../chat/Chat";
import FileContentPopup from "./FileContentPopup";
import "./FileExplorer.scss";
import FileExplorerSidebar from "./FileExplorerSidebar";
import FileTree from "./file-tree/FileTree";
import SavedPlans from "./saved-plans/SavedPlans";
import SavedChats from "./saved-chats/SavedChats";

interface FileExplorerProps {
  initialSplitterPosition?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  initialSplitterPosition = 20,
}) => {
  // State to manage the splitter position between file explorer and chat
  const [splitterPosition, setSplitterPosition] = useState(
    initialSplitterPosition
  );
  // Refs for sidebar and file content sections
  const sideBarRef = useRef<HTMLDivElement>(null);
  const fileContentRef = useRef<HTMLDivElement>(null);

  // State to track the currently active file (not in use currently)
  // const [activeFile, setActiveFile] = useState<string | null>(null);

  const { currentPath, selectedFiles } = useStore(codeChatStore$);

  // Fetch file tree data based on the current path using react-query
  const { data: fileTreeData } = useQuery({
    queryKey: ["repoData", currentPath],
    queryFn: async () => {
      const response = await axios.get(
        `${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`
      );
      return response.data;
    },
  });

  /**
   * Handles the dragging of the splitter to resize sidebar and chat sections.
   * Calculates the new splitter position based on the drag delta.
   * 
   * @param {any} e - Drag event object
   * @param {any} data - Drag data object containing deltaX
   */
  const handleSplitterDrag = (e: any, data: any) => {
    const newPosition =
      splitterPosition + (data.deltaX / window.innerWidth) * 100;
    // Ensure the new position is within the valid range (10% to 90%)
    setSplitterPosition(Math.max(10, Math.min(90, newPosition)));
  };

  // useEffect to update the widths of sidebar and chat sections when splitter position changes
  useEffect(() => {
    if (sideBarRef.current && fileContentRef.current) {
      const fileTreeStyle = window.getComputedStyle(sideBarRef.current);
      // Calculate and set the width of the sidebar considering padding
      sideBarRef.current.style.width = `calc(${splitterPosition}% - ${fileTreeStyle.paddingLeft} - ${fileTreeStyle.paddingRight})`;
      // Set the width of the chat section to occupy the remaining space
      fileContentRef.current.style.width = `${100 - splitterPosition}%`;
    }
  }, [splitterPosition]);

  // // Handler for right-click on a file (not in use currently)
  // const handleRightClick = (event: React.MouseEvent, nodeId: NodeId, filePath: string) => {
  //   event.preventDefault();
  //   updateCurrentPath(`${currentPath}/${filePath}`);
  //   updateSelectedFiles([]); // Clear any selected files
  // };

  return (
    <div className="file-viewer">
      {/* Sidebar component with file explorer and other sections */}
      <FileExplorerSidebar
        ref={sideBarRef}
        sections={[
          {
            id: "saved-chats",
            title: "Saved Chats",
            content: <SavedChats />,
            collapsed: false,
            height: 30,
          },
          {
            id: "saved-plans",
            title: "Saved Plans",
            content: <SavedPlans />,
            collapsed: false,
            height: 30,
          },
          {
            id: "files",
            title: "File Explorer",
            // FileTree component to display the directory structure
            content: (
              <FileTree
                data={fileTreeData?.children || []}
                onFileClick={(filePath) =>
                  updateFileContentPopup({ filePath, isOpen: true })
                }
              />
            ),
            collapsed: false,
            height: 40,
          },
        ]}
      />
      {/* Draggable splitter component */}
      <DraggableCore onDrag={handleSplitterDrag}>
        <div
          className="splitter"
          style={{ left: `${splitterPosition}%` }}
        ></div>
      </DraggableCore>
      {/* Chat section */}
      <div className="chat-section" ref={fileContentRef}>
        {/* Display content for the first selected file (or handle multiple files differently if needed) */}
        {/* {activeFile && <FileContent currentPath={currentPath} filePath={activeFile} />}  */}
        <Chat />
      </div>
      {/* Popup to display file content */}
      <FileContentPopup />
    </div>
  );
};

export default FileExplorer;
