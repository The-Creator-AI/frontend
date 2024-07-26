import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import config from '../../../../../config';
import MonacoEditor from '@monaco-editor/react';
import { codeChatStore$, initialState } from '../../../store/code-chat.store';
import useStore from '../../../../../state/useStore';
import './FileEditor.scss';
import { updateStage } from '../../../store/code-chat-store.logic';

interface FileEditorProps {
}

const FileEditor: React.FC<FileEditorProps> = ({ }) => {
    const { currentPath, stage } = useStore(codeChatStore$, initialState);
    const filePath = stage?.type === 'file' && stage.filePath;
    const content = stage?.type === 'file' && stage.content;

    const { isLoading, error } = useQuery({
        queryKey: ['fileContent', filePath],
        queryFn: async () => {
            if (!filePath) {
                throw Error('Filepath empty!');
            }
            const { data } = await axios.get(`${config.BASE_URL}/creator/file/content?path=${currentPath}/${filePath}`, {
                responseType: 'text'
            });
            updateStage({ content: data });
        },
        enabled: !!filePath, // Only fetch when the popup is open and filePath exists
    });

    return (
        <div className="file-content-popup-inner">
            <h2>{filePath}</h2>
            {isLoading && <div>Loading...</div>}
            {error && !content && <div>Error: {error.message}</div>}
            {content && filePath ? (
                <MonacoEditor
                    className='file-content-editor'
                    // height={window.innerHeight - window.innerHeight / 8}
                    // width={window.innerWidth - window.innerWidth / 8}
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
            ) : null}
        </div>
    );
};

export default FileEditor;

