import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import config from '../config';

interface FileContentProps {
  filePath: string;
}

const FileContent = ({ filePath }: FileContentProps) => {
  const { isPending, error, data } = useQuery({
    queryKey: ['fileContent', filePath],
    queryFn: async () => (await axios.get(`${config.BASE_URL}/creator/file/content?path=${filePath}`, {
        responseType: 'text'
    })).data
  });

  return (
    <div style={{ height: '100%' }}>
      {isPending && <p>Loading file content...</p>}
      {error && <p>Error loading file content: {error.message}</p>}
      {data && (
        <MonacoEditor
          theme='vs-dark'
          language='typescript'
          value={data}
          options={{
            minimap: {
              renderCharacters: true,
              maxColumn: 500,
              size: 'fit'
            }
          }}
        />
      )}
    </div>
  );
};

export default FileContent;