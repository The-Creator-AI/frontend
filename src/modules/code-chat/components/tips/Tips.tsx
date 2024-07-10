import React, { useEffect, useState } from "react";
import "./Tips.scss"; // Import your CSS file
import { LOCAL_STORAGE_KEY, getFromLocalStorage, saveToLocalStorage } from "../../../../utils/local-storage";

interface TipsProps {
  onClose?: () => void; // Function to close the tip
}

const Tips: React.FC<TipsProps> = ({ onClose }) => {
  const [showTip, setShowTip] = useState(false); // State to manage tip visibility

  // Check if the tip has been shown before
  useEffect(() => {
    const hasShownTip = getFromLocalStorage(LOCAL_STORAGE_KEY.TIP_SHOWN);
    if (hasShownTip === "true") {
      setShowTip(false); // Hide the tip if it has been shown
    } else {
      // Show the tip and mark it as shown
      setShowTip(true);
    }
  }, []);

  const handleClose = () => {
    setShowTip(false);
    saveToLocalStorage(LOCAL_STORAGE_KEY.TIP_SHOWN, "true");
    onClose && onClose(); // Call the onClose function to handle any additional actions
  };

  return (
    showTip ? ( // Only render the tip if showTip is true
      <div className="tips-container">
        <div className="tips-content">
          <p>
            <strong>Tip:</strong> Search for files quickly using the command
            palette!
          </p>
          <p>
            Press <kbd>Ctrl + P</kbd> (Windows/Linux) or <kbd>Meta + P</kbd>
            (macOS) to open it.
          </p>
          <button onClick={handleClose}>Got it!</button>
        </div>
      </div>
    ) : null
  );
};

export default Tips;
