import React, { useEffect, useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import ReactToolTip from "./ReactToolTip";

function Header({
  userData,
  selectedKeyCombination,
  handleKeyCombinationChange,
  setLastLoggdInUser,
}) {
  const storage = new Storage({ area: "local" });

  const initialFormat = userData?.stripeSubscriptionId ? true : false;

  useEffect(() => {
    storage.get("useStandardCopy").then((result) => {
      if (result === undefined) {
        storage.set("useStandardCopy", true);
        setUseStandardCopy(true);
      }
    });
  }, []);

  const [isOn, setIsOn] = useStorage(
    { key: "isOn", instance: new Storage({ area: "local" }) },
    true
  );
  const [useStandardCopy, setUseStandardCopy] = useStorage(
    { key: "useStandardCopy", instance: storage },
    true
  );
  const [format, setFormat] = useStorage(
    { key: "format", instance: new Storage({ area: "local" }) },
    initialFormat
  );
  const [lastLoggedInUser, setLastLoggedInUser] = useStorage({
    key: "lastLoggedInUser",
    instance: new Storage({
      area: "local",
    }),
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [profiledropdown, setProfiledropdown] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const openOrFocusTab = (url) => {
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find((tab) => tab.url === url);
      if (existingTab) {
        chrome.tabs.update(existingTab.id, { active: true });
      } else {
        chrome.tabs.create({ url });
      }
    });
  };

  const handleRedirect = () => {
    openOrFocusTab("https://www.copyin2clicks.com/");
  };

  const redirectToLogin = () => {
    openOrFocusTab("https://www.copyin2clicks.com/login");
  };

  const redirectToPremium = () => {
    openOrFocusTab("https://www.copyin2clicks.com/premium");
  };

  const handleProfiletoggle = () => {
    setProfiledropdown(!profiledropdown);
    if (userData.stripeSubscriptionId) {
      setFormat(true);
    }
  };

  const handleLogout = async () => {
    setLastLoggdInUser(userData.email);
    setLastLoggedInUser(userData.email);

    try {
      const res = await fetch(
        "https://www.copyin2clicks.com/api/auth/signout?callbackUrl=/api/auth/session",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: await fetch(
            "https://www.copyin2clicks.com/api/auth/csrf"
          ).then((rs) => rs.text()),
        }
      );
      console.log("res", res);

      if (res) {
        openOrFocusTab("https://www.copyin2clicks.com/login");
      }
    } catch (err) {
      console.log("Failed to logout");
    }
  };
  const handleFormattingChange = () => {
    if (userData && userData.stripeSubscriptionId) {
      setFormat(!format);
      setError("");
    } else {
      setError("Please upgrade to premium to use this feature.");
      setShowError(true); // Show the error message
    }
  };

  const handleDismissError = () => {
    setShowError(false); // Hide the error message
  };

  useEffect(() => {
    if (!userData?.stripeSubscriptionId) {
      setFormat(false);
    } else{
      setFormat(true)
    }

  }, [userData?.stripeSubscriptionId]);

  return (
    <>
      <div className="p-2 bg-slate-900 text-white flex justify-between items-center">
        <div className="">
          {/* <a
            href="https://extension-landing-page-zeta.vercel.app/premium"
            target="_blank"
          > */}
          <div
            onClick={redirectToPremium}
            className="p-1 rounded font-bold text-white border transition ease-in-out duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer"
          >
            {userData?.stripeSubscriptionId ? "Manage Subscription" : "Upgrade"}
          </div>
          {/* </a> */}
        </div>
        <div
          className="text-2xl font-bold title cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
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

        <div className="flex justify-center items-center gap-2">
          <div className="">
            {userData.name ? (
              <div
                className="inline-flex items-center justify-center w-8 h-8 cursor-pointer overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600"
                onClick={handleProfiletoggle}
              >
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {userData?.name?.substring(0, 2).toUpperCase()}
                </span>
              </div>
            ) : (
              <div
                onClick={redirectToLogin}
                className="p-1 rounded font-bold text-white border transition ease-in-out duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer"
              >
                Login
              </div>
            )}
          </div>

          <div>
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
                    <div className="text-sm">Formatting</div>
                    <label className="switch text-black">
                      <input
                        onChange={handleFormattingChange}
                        checked={format}
                        type="checkbox"
                        id="copyStandardToggle"
                      />
                      <div className="slider round"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm">Keyboard Copy Key</div>
                    <select
                      style={{ fontSize: "12px" }}
                      value={selectedKeyCombination}
                      onChange={handleKeyCombinationChange}
                      className="py-1.5 px-1 border border-black bg-white rounded-md shadow-sm focus:outline-none"
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
          {profiledropdown && (
            <div className="absolute right-10 top-12 bg-white rounded-md shadow-lg z-2 text-black">
              <div className="p-2">
                <div className="flex justify-end items-end cursor-pointer">
                  <div
                    className="text-sm cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showError && (
        <div className="relative">
          <div className="absolute z-50 top-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white text-yellow-600 p-4 rounded shadow-lg text-center m-8">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  fill="#f59e0b"
                  className="w-12 h-12"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <p>
                {error}
                <br />
                <a
                  style={{ color: ":#f59e0b", textDecoration: "underline" }}
                  href="https://extension-landing-page-zeta.vercel.app/premium"
                  target="_blank"
                >
                  ✨ Click here to expand your clipboard and enhance your
                  productivity! ✨
                </a>
              </p>
              <button
                onClick={handleDismissError}
                className="bg-yellow-600 hover:bg-yellow-400 text-white font-bold py-1 px-4 rounded mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;