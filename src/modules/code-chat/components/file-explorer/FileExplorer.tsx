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

interface FileExplorerProps {
  initialSplitterPosition?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  initialSplitterPosition = 20,
}) => {
  const [splitterPosition, setSplitterPosition] = useState(
    initialSplitterPosition
  );
  const sideBarRef = useRef<HTMLDivElement>(null);
  const fileContentRef = useRef<HTMLDivElement>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const { currentPath, selectedFiles } = useStore(codeChatStore$);
  const { data: fileTreeData } = useQuery({
    queryKey: ["repoData", currentPath],
    queryFn: async () => {
      const response = await axios.get(
        `${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`
      );
      return response.data;
    },
  });

  const handleSplitterDrag = (e: any, data: any) => {
    const newPosition =
      splitterPosition + (data.deltaX / window.innerWidth) * 100;
    setSplitterPosition(Math.max(10, Math.min(90, newPosition)));
  };

  useEffect(() => {
    if (sideBarRef.current && fileContentRef.current) {
      const fileTreeStyle = window.getComputedStyle(sideBarRef.current);
      sideBarRef.current.style.width = `calc(${splitterPosition}% - ${fileTreeStyle.paddingLeft} - ${fileTreeStyle.paddingRight})`;
      fileContentRef.current.style.width = `${100 - splitterPosition}%`;
    }
  }, [splitterPosition]);

  // const handleRightClick = (event: React.MouseEvent, nodeId: NodeId, filePath: string) => {
  //   event.preventDefault();
  //   updateCurrentPath(`${currentPath}/${filePath}`);
  //   updateSelectedFiles([]); // Clear any selected files
  // };

  return (
    <div className="file-viewer">
      <FileExplorerSidebar
        ref={sideBarRef}
        sections={[
          {
            id: "settings",
            title: "Settings",
            content: <div>Settings content here</div>,
            collapsed: false,
            height: 30,
          },
          {
            id: "files",
            title: "File Explorer",
            content: (
              <FileTree
                data={fileTreeData?.children || []}
                onFileClick={(filePath) =>
                  updateFileContentPopup({ filePath, isOpen: true })
                }
              />
            ),
            collapsed: false,
            height: 70,
          },
        ]}
      />
      <DraggableCore onDrag={handleSplitterDrag}>
        <div
          className="splitter"
          style={{ left: `${splitterPosition}%` }}
        ></div>
      </DraggableCore>
      <div className="chat-section" ref={fileContentRef}>
        {/* Display content for the first selected file (or handle multiple files differently if needed) */}
        {/* {activeFile && <FileContent currentPath={currentPath} filePath={activeFile} />}  */}
        <Chat />
      </div>
      <FileContentPopup />
    </div>
  );
};

export default FileExplorer;
