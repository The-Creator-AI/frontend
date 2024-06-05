import React, { useEffect, useRef, useState } from 'react';
import { NodeId } from 'react-accessible-treeview';
import { DraggableCore } from 'react-draggable';
import FileContent from './FileContent';
import FileTree from './FileTree';
import './FileViewer.scss';

interface FileViewerProps {
    initialSplitterPosition?: number;
}

const FileViewer: React.FC<FileViewerProps> = ({ initialSplitterPosition = 20 }) => {
    const [selectedFile, setSelectedFile] = useState<{
        nodeId: NodeId;
        filePath: string;
    }>();
    const [splitterPosition, setSplitterPosition] = useState(initialSplitterPosition); // Initial position (percentage)
    const fileTreeRef = useRef<HTMLDivElement>(null);
    const fileContentRef = useRef<HTMLDivElement>(null);

    const handleSplitterDrag = (e: any, data: any) => {
        const newPosition = splitterPosition + (data.deltaX / window.innerWidth) * 100;
        setSplitterPosition(Math.max(10, Math.min(90, newPosition)));
    };

    // Update column widths based on splitter position
    useEffect(() => {
        if (fileTreeRef.current && fileContentRef.current) {
            fileTreeRef.current.style.width = `${splitterPosition}%`;
            fileContentRef.current.style.width = `${100 - splitterPosition}%`;
        }
    }, [splitterPosition]);

    return (
        <div className="file-viewer">
            <div className="file-tree" ref={fileTreeRef} style={{ overflow: 'auto', height: '100%' }}>
                <FileTree selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            </div>
            <DraggableCore onDrag={handleSplitterDrag}>
                <div className="splitter" style={{ left: `${splitterPosition}%` }}></div>
            </DraggableCore>
            <div className="file-content" ref={fileContentRef} style={{ overflow: 'auto', height: '100%' }}>
                {selectedFile && <FileContent filePath={selectedFile.filePath} />}
            </div>
        </div>
    );
};

export default FileViewer;