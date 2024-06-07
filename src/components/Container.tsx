import React, { useEffect, useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa";

import Item from "./Item";
import ReactToolTip from "./ReactToolTip";

function Container() {
  const [showTooltip, setShowTooltip] = useState(false);

  let [key, setKey] = useState("");
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

  useEffect(() => {
    let platform = navigator.platform;
    if (platform.includes("Mac")) {
      setKey("Option");
    } else {
      setKey("AltKey");
    }
  }, []);

  function clearCopiedItems() {
    const starredItems = recentlyCopiedItems.filter((item) => item.starred);
    let remainingItems = starredItems;

    if (starredItems.length > 0) {
      remainingItems = starredItems.map((item, index) => {
        if (index === 0) {
          return { ...item, starred: false };
        }
        return item;
      });
    }

    setRecentlyCopiedItems(remainingItems);
    setToolTip("All unstarred copied items removed!");
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 2000);
  }

  function toggleStar(index) {
    const updatedItems = [...recentlyCopiedItems];
    const item = updatedItems[index];
    if (
      !item.starred &&
      updatedItems.filter((item) => !item.starred).length === 1
    ) {
      setToolTip("At least one item must remain unstarred!");
      setShowTooltip(true);
      setTimeout(() => {
        setToolTip("");
        setShowTooltip(false);
      }, 2000);
      return;
    }
    item.starred = !item.starred;
    setRecentlyCopiedItems(updatedItems);
  }

  function unstarAllItems() {
    const updatedItems = recentlyCopiedItems.map((item) => ({
      ...item,
      starred: false,
    }));
    setRecentlyCopiedItems(updatedItems);
    setToolTip("All items have been unstarred!");
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 2000);
  }

  const hasStarredItems = recentlyCopiedItems.some((item) => item.starred);

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
                  onClick={unstarAllItems}
                />
                <ReactToolTip
                  text="Unstar All Items"
                  anchorSelect="#unstarred"
                  place="bottom-end"
                />
              </>
            )}

            <AiOutlineDelete
              className="text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100 no-focus-outline"
              onClick={clearCopiedItems}
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
      <div className="p-1 flex flex-col gap-1.5 max-h-[300px] mt-2 mb-2  overflow-auto">
        {recentlyCopiedItems.map((item, index) => (
          <Item
            text={item.text}
            index={index}
            key={item.text + index}
            starred={item.starred}
            toggleStar={toggleStar}
          />
        ))}
        {recentlyCopiedItems.length === 0 && (
          <p className="text-base font-semibold text-center text-gray-500 mt-1">
            To Start:
            <br />
            1. Hover over the text, press "Option/Alt" on your keyboard while
            clicking on your mouse pad.
            <br />
            2. While still pressing “Option/Alt” move your mouse to the last
            letter and click again
            <br />
            3. That’s it! Click, click and you’re done!
          </p>
        )}
      </div>
    </div>
  );
}

export default Container;
