import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import config from '../../../../config';
import MonacoEditor from '@monaco-editor/react';
import { appStore$, initialState, updateFileContentPopup } from '../../store/app.store';
import useStore from '../../../../state/useStore';
import './FileContentPopup.scss';

interface FileContentPopupProps {
}

const FileContentPopup: React.FC<FileContentPopupProps> = ({ }) => {
    const { currentPath, fileContentPopup: { isOpen, filePath, content }} = useStore(appStore$, initialState);
    const ref = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        // Check if the click is on the backdrop
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                updateFileContentPopup({ isOpen: false, filePath: undefined });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        // Check if pressed key is Escape
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                updateFileContentPopup({ isOpen: false, filePath: undefined });
            }
        }
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        }
    }, []);

    if (!isOpen) {
        return null;
    }

    return (
        <div ref={ref}
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
                        className='file-content-editor'
                        height={window.innerHeight - window.innerHeight/8}
                        width={window.innerWidth - window.innerWidth/8}
                        value={content}
                        path={filePath}
                        options={{
                            readOnly: true, // Make the editor read-only
                            fontSize: 14,
                            minimap: {
                                // renderCharacters: true,
                                // maxColumn: 500,
                                size: 'fit'
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default FileContentPopup;

