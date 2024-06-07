import React from "react";

const Instructions = ({ onClose }) => {
  return (
    <div className="instruction-popup">
      <div className="instruction-content">
        <h1>How to Pin the Extension</h1>
        <p>Follow these steps to pin the extension to your toolbar:</p>
        <ol>
          <li>
            Click on the puzzle icon (<img src={chrome.runtime.getURL("puzzle_icon.png")} alt="Puzzle Icon" className="icon" />) in the top-right corner of your browser.
          </li>
          <li>Find "Your Extension Name" in the list.</li>
          <li>
            Click the pin icon (<img src={chrome.runtime.getURL("pin_icon.png")} alt="Pin Icon" className="icon" />) next to the extension name to pin it to the toolbar.
          </li>
        </ol>
        <img src={chrome.runtime.getURL("instructions_image.png")} alt="Instructions" className="instruction-image" />
        <button className="button" onClick={onClose}>Got It!</button>
      </div>
    </div>
  );
};

export default Instructions;
