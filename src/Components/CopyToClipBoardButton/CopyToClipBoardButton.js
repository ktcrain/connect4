import React, { useRef } from "react";
import "./CopyToClipBoardButton.scss";
import { FaCopy } from "react-icons/fa";

function CopyToClipBoardButton({ children }) {
  const copyRef = useRef();

  const handleCopyToClipboard = () => {
    console.log("handleCopyToClipboard");
    copyRef.current.select();
    copyRef.current.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied the text: " + copyRef.current.value);
  };

  return (
    <div className="CopyToClipboardButton">
      <input readOnly ref={copyRef} value={children} />
      {/* <span className="Contents">{children}</span> */}
      <span className="CopyIcon" onClick={handleCopyToClipboard}>
        <FaCopy />
      </span>
    </div>
  );
}

export default CopyToClipBoardButton;
