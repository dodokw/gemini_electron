// src/components/TitleBar/index.tsx
import React from "react";
import "./TitleBar.css";

const TitleBar = () => {
  const handleGoBack = () => window.electronAPI.goBack();
  const handleGoForward = () => window.electronAPI.goForward();
  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();

  return (
    <div className="title-bar">
      <div style={{ width: 200, height: 20 }} />
      <div className="title-bar-drag-region">
        <div className="title-bar-title">G-CLI</div>
      </div>
      <div className="title-bar-controls">
        <button onClick={handleGoBack} className="nav-button">
          ‹
        </button>
        <button onClick={handleGoForward} className="nav-button">
          ›
        </button>

        <button
          onClick={handleMinimize}
          className="control-button"
          aria-label="Minimize"
        >
          ─
        </button>
        <button
          onClick={handleMaximize}
          className="control-button"
          aria-label="Maximize"
        >
          □
        </button>
        <button
          onClick={handleClose}
          className="control-button close-button"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
