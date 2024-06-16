import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import config from '../../config';
import MonacoEditor from '@monaco-editor/react';
import { appStore$, initialState, updateFileContentPopup } from '../../state/app.store';
import useStore from '../../state/useStore';
import './FileContentPopup.scss';

interface FileContentPopupProps {
}

const FileContentPopup: React.FC<FileContentPopupProps> = ({ }) => {
    const { currentPath, fileContentPopup: { isOpen, filePath, content }} = useStore(appStore$, initialState);

    const { isLoading, error } = useQuery({
        queryKey: ['fileContent', filePath],
        queryFn: async () => {
            if (!filePath) return;
            const { data } = await axios.get(`${config.BASE_URL}/creator/file/content?path=${currentPath}/${filePath}`, {
                responseType: 'text'
            });
            updateFileContentPopup({ content: data });
        },
        enabled: isOpen && !!filePath, // Only fetch when the popup is open and filePath exists
    });

    console.log({ error });

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="file-content-popup"
            onClick={(e) => {
                if (e.target === e.currentTarget) { // Check if the click is on the backdrop
                    updateFileContentPopup({ isOpen: false, filePath: undefined });
                }
            }}
        >
            <div className="file-content-popup-inner">
                <button onClick={() => updateFileContentPopup({ isOpen: false, filePath: undefined })}>Close</button>
                <h2>{filePath}</h2>
                {isLoading && <div>Loading...</div>}
                {error && !content && <div>Error: {error.message}</div>}
                {content && (
                    <MonacoEditor
                        height={window.innerHeight - window.innerHeight/8}
                        width={window.innerWidth - window.innerWidth/8}
                        value={content}
                        options={{
                            readOnly: true, // Make the editor read-only
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default FileContentPopup;

