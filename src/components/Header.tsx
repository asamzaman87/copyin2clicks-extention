import React, { useEffect, useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import ReactToolTip from "./ReactToolTip";

function Header() {
  const [isOn, setIsOn] = useStorage(
    { key: "isOn", instance: new Storage({ area: "local" }) },
    true
  );
  const [useStandardCopy, setUseStandardCopy] = useStorage(
    { key: "useStandardCopy", instance: new Storage({ area: "local" }) },
    false
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedKeyCombination, setSelectedKeyCombination] = useStorage(
    { key: "key", instance: new Storage({ area: "local" }) },
    "altKey"
  );



  const handleRedirect = () => {
    window.open("https://google.com", "_blank");
  };

  const handleKeyCombinationChange = (e) => {
    setSelectedKeyCombination(e.target.value);
  };

  return (
    <div className="p-2 bg-slate-900 text-white">
      <div className="absolute left-2.5 top-2.5 text-left">
        <button className="p-1 rounded font-bold text-white border-2 transition ease-in-out duration-300 hover:bg-gray-700 hover:shadow-md">
          Support Idea
        </button>
      </div>
      <div
        className="text-center ml-5 text-2xl font-bold title cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
        id="CopyIn2Clicks-title"
        onClick={handleRedirect}
      >
        CopyIn2Clicks
      </div>
      <ReactToolTip
        text="Click to go to Website"
        anchorSelect="#CopyIn2Clicks-title"
        place="bottom"
      />
      <div className="absolute right-2.5 top-2.5">
        <button
          id="setting-ext-icon"
          className="text-white text-2xl font-bold"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          ⚙️
        </button>
        <ReactToolTip
          text="Extension Settings"
          anchorSelect="#setting-ext-icon"
          place="bottom-start"
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 text-black">
            <div className="p-2">
              <div className="flex justify-between items-center">
                <div className="text-sm">Extension</div>
                <label className="switch text-black text-sm">
                  <input
                    onChange={() => setIsOn(!isOn)}
                    checked={isOn}
                    type="checkbox"
                    id="togBtn"
                  />
                  <div className="slider round"></div>
                </label>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">Regular Copy Storage</div>
                <label className="switch text-black">
                  <input
                    onChange={() => setUseStandardCopy(!useStandardCopy)}
                    checked={useStandardCopy}
                    type="checkbox"
                    id="copyStandardToggle"
                  />
                  <div className="slider round"></div>
                </label>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">Keyboard Copy Key</div>
                <select
                  value={selectedKeyCombination}
                  onChange={handleKeyCombinationChange}
                  className="w-[137px] p-1.5 border border-black bg-white rounded-md shadow-sm focus:outline-none sm:text-sm select-custom"
                >
                  <option value="altKey">Alt/Option</option>
                  <option value="metaKey">Command/Window</option>
                  {/* Add more key combination options as needed */}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
