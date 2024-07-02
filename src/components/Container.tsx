import React, { useEffect, useRef, useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa";
import Item from "./Item";
import ReactToolTip from "./ReactToolTip";

function Container({ userData }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [currentAction, setCurrentAction] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const [key, setKey] = useState("");
  const [recentlyCopiedItems, setRecentlyCopiedItems] = useStorage(
    {
      key: "recentlyCopiedItems",
      instance: new Storage({
        area: "local",
      }),
    },
    []
  );
  const storage = new Storage({ area: "local" });
  const [toolTip, setToolTip] = useStorage(
    { key: "alert", instance: storage },
    ""
  );

  const listRef = useRef(null);

  useEffect(() => {
    let platform = navigator.platform;
    setKey(platform.includes("Mac") ? "Option" : "AltKey");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        listRef.current &&
        listRef.current.scrollHeight - listRef.current.scrollTop ===
          listRef.current.clientHeight
      ) {
        if (
          recentlyCopiedItems.length >= 5 &&
          !userData?.stripeSubscriptionId
        ) {
          setShowUpgradePopup(true);
        }
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [recentlyCopiedItems, userData]);

  function handleClearConfirmation() {
    setConfirmationMessage(
      "Are you sure you want to clear all unstarred items?"
    );
    setCurrentAction("clear");
    setShowConfirmationModal(true);
  }

  function handleUnstarConfirmation() {
    setConfirmationMessage("Are you sure you want to unstar all items?");
    setCurrentAction("unstar");
    setShowConfirmationModal(true);
  }

  function confirmAction(confirm) {
    setShowConfirmationModal(false);
    if (confirm) {
      if (currentAction === "clear") {
        clearCopiedItems();
      } else if (currentAction === "unstar") {
        unstarAllItems();
      }
    }
  }

  function clearCopiedItems() {
    const unstarredItems = recentlyCopiedItems.filter((item) => !item.starred);

    if (unstarredItems.length === 0) {
      setToolTip("No Unstarred Items To Delete!");
      setShowTooltip(true);
      setTimeout(() => {
        setToolTip("");
        setShowTooltip(false);
      }, 2000);
      return;
    }

    const starredItems = recentlyCopiedItems.filter((item) => item.starred);

    setRecentlyCopiedItems(starredItems);
    setToolTip("All Unstarred Copied Items Removed!");
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 2000);
  }

  function toggleStar(index) {
    const isSubscribed = userData?.stripeSubscriptionId;
    const updatedItems = [...recentlyCopiedItems];
    const item = updatedItems[index];
    const maxitem = isSubscribed ? 15 : 5;

    if (
      !item.starred &&
      updatedItems.filter((item) => !item.starred).length === 1 &&
      recentlyCopiedItems.length >= maxitem
    ) {
      setToolTip("At Least One Item Must Remain Unstarred!");
      setShowTooltip(true);
      setTimeout(() => {
        setToolTip("");
        setShowTooltip(false);
      }, 2000);
      return;
    }

    item.starred = !item.starred;
    setRecentlyCopiedItems(updatedItems);

    if (item.starred) {
      setToolTip("Copied Item Starred!");
    } else {
      setToolTip("Copied Item Unstarred!");
    }
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 500);
  }

  function unstarAllItems() {
    const updatedItems = recentlyCopiedItems.map((item) => ({
      ...item,
      starred: false,
    }));
    setRecentlyCopiedItems(updatedItems);
    setToolTip("All Items Have Been Unstarred!");
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 2000);
  }

  const hasStarredItems = recentlyCopiedItems.some((item) => item.starred);

  // Display logic
  let displayItems = [];
  if (userData?.stripeSubscriptionId) {
    displayItems = recentlyCopiedItems; // Show all items if subscribed
  } else {
    displayItems = recentlyCopiedItems.filter(
      (item) => item.starred || recentlyCopiedItems.indexOf(item) < 5
    ).slice(0,5); 
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        {recentlyCopiedItems.length > 0 && (
          <h1 className="text-base font-bold">Recently Copied Items:</h1>
        )}
        {recentlyCopiedItems.length > 0 && (
          <div className="flex justify-center items-center gap-1">
            {hasStarredItems && (
              <>
                <FaRegStar
                  id="unstarred"
                  className="text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-100 no-focus-outline"
                  onClick={handleUnstarConfirmation}
                />
                <ReactToolTip
                  text="Unstar All Items"
                  anchorSelect="#unstarred"
                  place="bottom-end"
                />
              </>
            )}

            <AiOutlineDelete
              className="text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-100 no-focus-outline"
              onClick={handleClearConfirmation}
              id="delete-all-icon"
            />
            <ReactToolTip
              text="Delete All"
              anchorSelect="#delete-all-icon"
              place="bottom-end"
            />
          </div>
        )}
      </div>
      <div
        ref={listRef}
        className="p-1 flex flex-col gap-1.5 max-h-[200px] mt-2 mb-2  overflow-auto"
      >
        {displayItems.map((item, index) => (
          <Item
            text={item.text}
            index={index}
            key={item.text + index}
            starred={item.starred}
            toggleStar={toggleStar}
            userData={userData}
          />
        ))}
        {recentlyCopiedItems.length === 0 && (
          <p className="text-base font-semibold text-center text-gray-500 mt-1">
            To Start:
            <br />
            1. Hover over the text, press "{key}" on your keyboard while
            clicking on your mouse pad.
            <br />
            2. While still pressing “{key}” move your mouse to the last letter
            and click again
            <br />
            3. That’s it! Click, click and you’re done!
          </p>
        )}
      </div>

      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">{confirmationMessage}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => confirmAction(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-4 rounded"
              >
                No
              </button>
              <button
                onClick={() => confirmAction(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
              Want to save more than 5 of your recently copied text?
              <br /> Upgrade to CopyIn2Clicks Premium and save more of your
              copied items!
              <br /> <a style={{color : ':#f59e0b', textDecoration : 'underline'}} href="https://extension-landing-page-zeta.vercel.app/premium" target="_blank">✨ Click here to expand your clipboard and enhance your
              productivity! ✨</a>
            </p>
            <button
              onClick={() => setShowUpgradePopup(false)}
              className="bg-yellow-600 hover:bg-yellow-400 text-white font-bold py-1 px-4 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Container;
