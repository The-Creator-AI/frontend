import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Research.scss';


function CodeChat() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="Research">
      {JSON.stringify(Object.fromEntries(searchParams.entries()))}
    </div>
  );
}

export default CodeChat;
