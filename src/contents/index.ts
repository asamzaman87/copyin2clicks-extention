import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["http://*/*", "https://*/*"],
  all_frames: true,
};

let startNode = null;
let endNode = null;
let selectedText = "";
let isSelectionCompleted = false;
const bracketStartElementClass = "copy-in-click-ext-bracket-start";
const bracketEndElementClass = "copy-in-click-ext-bracket-end";
let blinkingInterval;
let targetElement = null;

const renderPopup = () => {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999998; /* Place it below the popup */
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  `;
  document.body.appendChild(overlay);

  function closePopup() {
    // Remove overlay
    overlay.remove();

    popup.style.opacity = "0";
    setTimeout(() => {
      popup.remove();
      window.getSelection().removeAllRanges();

      // Clear brackets in input/textarea after clicking "OK"
      if (targetElement) {
        const inputValue = targetElement.value;
        targetElement.value = inputValue.replace(/\[|\]/g, "");
        targetElement = null;
      }
    }, 100);
  }

  const popup = document.createElement("div");
  popup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;
    z-index: 999999;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    opacity: 0;
    transition: opacity 0.2s ease; 
  `;

  // Add content to the popup
  const primaryColor = "#3c82f6";
  const buttonStyles = `border:1px solid ${primaryColor};border-radius:6px;padding:4px 40px;background:${primaryColor};color:white;cursor:pointer;font-weight:bold;`;
  popup.innerHTML = `
    <div>
      <div style="display:flex;justify-content:center;padding:8px;padding-bottom:0;" >
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 256 256" xml:space="preserve">
        <defs></defs>
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
          <polygon points="37.95,64.44 23.78,50.27 30.85,43.2 37.95,50.3 59.15,29.1 66.22,36.17 " style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,158,4); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/>
          <path d="M 45 90 C 20 90 0 70 0 45 C 0 20 20 0 45 0 c 25 0 45 20 45 45 C 90 70 70 90 45 90 z M 45 10 c -19 0 -35 16 -35 35 s 16 35 35 35 s 35 -16 35 -35 S 64 10 45 10 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,158,4); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        </g>
        </svg>
      </div>
      <div style="padding: 20px; padding-top: 8px;">
        <div style="padding:4px;color:black;font-weight:bold;" >Text successfully copied and stored!</div>
        <div style="display:flex;justify-content:center;margin-top:16px" >
          <button id="closeButton" style="${buttonStyles}" >OK</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  popup.offsetHeight;
  popup.style.opacity = "1";
  const closeButton = popup.querySelector("#closeButton");
  closeButton.addEventListener("click", closePopup);

  // Prevent clicks on the overlay from propagating to elements below
  overlay.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
};

const renderErrorPopup = (errorMessage: string) => {
  const errorPopup = document.createElement("div");
  errorPopup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;
    z-index: 999999;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    opacity: 0;
    transition: opacity 0.2s ease; 
    padding: 20px;
    text-align: center;
  `;
  errorPopup.innerHTML = `
  <div style="display:flex;justify-content:center;padding:8px;padding-bottom:0;" >

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
  </div>

  <div style="padding: 20px; padding-top: 8px;">
  <div style="padding:4px;color:red;font-weight:bold;" >${errorMessage}</div>

</div>
  `;
  document.body.appendChild(errorPopup);
  errorPopup.offsetHeight;
  errorPopup.style.opacity = "1";
  setTimeout(() => {
    errorPopup.style.opacity = "0";
    setTimeout(() => {
      errorPopup.remove();
    }, 200);
  }, 1500); // Remove error popup after 3 seconds
};

// for default copy text

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "c") {
    if (typeof chrome.storage === "undefined") {
      console.error("chrome.storage is not available.");
      return;
    }
    chrome.storage.local.get(["isOn", "useStandardCopy"], function (result) {
      const isOn = result.isOn === true || result.isOn === "true";
      const useStandardCopy =
        result.useStandardCopy === true || result.useStandardCopy === "true";
      // If both isOn and useStandardCopy are true, copy the selected text to the clipboard
      if (isOn && useStandardCopy) {
        const selection = window.getSelection().toString();
        if (selection) {
          saveCopiedText(selection);
        }
      }
    });
  }
});


// for copy using alt.key
document.addEventListener("click", function (event) {
  event.preventDefault();
  if (typeof chrome.storage === "undefined") {
    console.error("chrome.storage is not available.");
    return;
  }
  chrome.storage.local.get(["isOn", "key"], function (result) {
    if (result.isOn === true || result.isOn === "true") {
      const keyCombination = result.key || "altKey";
      if (event[keyCombination.replaceAll('"', "")]) {
        const target = event.target;
        if (
          (target as HTMLElement).tagName === "INPUT" ||
          (target as HTMLElement).tagName === "TEXTAREA"
        ) {
          const cursorPosition = (
            target as HTMLInputElement | HTMLTextAreaElement
          ).selectionStart;
          const inputValue = (target as HTMLInputElement | HTMLTextAreaElement)
            .value;
          const openingBracketIndex = inputValue.indexOf("[");
          const closingBracketIndex = inputValue.indexOf("]");

          if (openingBracketIndex === -1) {
            // Insert opening bracket if not already present
            const newValue =
              inputValue.substring(0, cursorPosition) +
              "[" +
              inputValue.substring(cursorPosition);
            (target as HTMLInputElement | HTMLTextAreaElement).value = newValue;
            (target as HTMLInputElement | HTMLTextAreaElement).selectionEnd =
              cursorPosition + 1;
            (target as HTMLInputElement | HTMLTextAreaElement).focus();
          } else if (openingBracketIndex !== -1 && closingBracketIndex === -1) {
            // Insert closing bracket if opening bracket is already present
            if (cursorPosition > openingBracketIndex) {
              const newValue =
                inputValue.substring(0, cursorPosition) +
                "]" +
                inputValue.substring(cursorPosition);
              (target as HTMLInputElement | HTMLTextAreaElement).value =
                newValue;
              (target as HTMLInputElement | HTMLTextAreaElement).selectionEnd =
                cursorPosition + 1;
              (target as HTMLInputElement | HTMLTextAreaElement).focus();
              // Select the text between the brackets
              const selectedText = newValue.substring(
                openingBracketIndex + 1,
                cursorPosition
              );
              (
                target as HTMLInputElement | HTMLTextAreaElement
              ).setSelectionRange(openingBracketIndex + 1, cursorPosition);
              saveCopiedText(selectedText, target);
            } else {
              const errorMessage =
                "CopyIn2Clicks Error: Closing Bracket Must be Placed After the Opening Bracket";
              renderErrorPopup(errorMessage);
            }
          }
        } else {
          if (isSelectionCompleted) {
            isSelectionCompleted = false;
            resetAll();
          }
          if (!startNode) {
            startNode = findTextNodeFromPoint(event.clientX, event.clientY);
            addStartIcon(
              event.clientX,
              event.clientY,
              event.pageX,
              event.pageY
            );
          } else if (startNode) {
            endNode = findTextNodeFromPoint(event.clientX, event.clientY);
            addEndIcon(event.clientX, event.clientY, event.pageX, event.pageY);
          }
        }
      } else {
        resetAll();
      }
    }
  });
});

function addStartIcon(x, y, pageX, pageY) {
  insertBrackets("[", x, y);
}

function addEndIcon(x, y, pageX, pageY) {
  const startBracket = document.querySelector(`.${bracketStartElementClass}`);
  if (!startBracket) return;

  const startBracketRect = startBracket.getBoundingClientRect();

  const endX = x;
  const endY = y;

  if (
    endY > startBracketRect.bottom ||
    (endY > startBracketRect.top && endX > startBracketRect.right)
  ) {
    insertBrackets("]", x, y);
    selectTextBetweenBrackets();
  } else {
    const errorMessage =
      "CopyIn2Clicks Error: Closing Bracket Must be Placed After the Opening Bracket";
    renderErrorPopup(errorMessage);
  }
}

async function saveCopiedText(hasText = "", target = null) {
  targetElement = target; // Store reference to the target element
  chrome.storage.local.get(["recentlyCopiedItems"], async (result) => {
    let items = result?.recentlyCopiedItems || "[]";
    items = Array.from(JSON.parse(items));
    if (selectedText === "" && !hasText) return;
    const newItem = { text: hasText ? hasText : selectedText, starred: false };
    items.unshift(newItem);
    items = items.length > 10 ? items.slice(0, 10) : items;
    await chrome.storage.local.set({
      recentlyCopiedItems: JSON.stringify(items),
    });
    await navigator.clipboard.writeText(newItem.text);
    isSelectionCompleted = true;
    setTimeout(() => renderPopup(), 500);
  });
}

function selectTextBetweenBrackets() {
  const startBracket = document.querySelector(`.${bracketStartElementClass}`);
  const endBracket = document.querySelector(`.${bracketEndElementClass}`);
  if (startBracket && endBracket) {
    const range = document.createRange();
    range.setStartAfter(startBracket);
    range.setEndBefore(endBracket);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    selectedText = selection.toString();
    saveCopiedText();
  }
}

function insertBrackets(textContent, x, y) {
  const range = document.caretRangeFromPoint(x, y);
  if (!range) return;

  const startBracket = document.createElement("span");
  startBracket.textContent = textContent;
  if (textContent === "[") {
    startBracket.classList.add(bracketStartElementClass);
  } else {
    startBracket.classList.add(bracketEndElementClass);
  }

  range.insertNode(startBracket);
  var visible = true;
  blinkingInterval = setInterval(function () {
    startBracket.style.opacity = visible ? "0.2" : "1";
    visible = !visible;
  }, 500);
}

function resetAll() {
  startNode = null;
  endNode = null;
  selectedText = "";
  let bracketStart = document.querySelectorAll(`.${bracketStartElementClass}`);
  let bracketEnd = document.querySelectorAll(`.${bracketEndElementClass}`);
  if (bracketStart) bracketStart.forEach((bracket) => bracket.remove());
  if (bracketEnd) bracketEnd.forEach((bracket) => bracket.remove());
  clearInterval(blinkingInterval);
}

function findTextNodeFromPoint(x, y) {
  try {
    const elems = document.elementsFromPoint(x, y);
    for (const elem of elems) {
      if (elem.tagName === "A") {
        const walker = document.createTreeWalker(
          elem,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node = walker.nextNode();
        while (node) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const rects = range.getClientRects();
          for (const rect of rects) {
            if (
              x >= rect.left &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom
            ) {
              return { node, offset: getTextOffsetInNode(range, x, y) };
            }
          }
          node = walker.nextNode();
        }
      }
      const walker = document.createTreeWalker(
        elem,
        NodeFilter.SHOW_TEXT,
        null
      );
      let node = walker.nextNode();
      let nearestFirstNode = null;
      let nearestLastNode = null;
      do {
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          if (!nearestFirstNode) {
            nearestFirstNode = node;
          }
          nearestLastNode = node;
        }
        for (const rect of rects) {
          if (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
          ) {
            const offset = getTextOffsetInNode(range, x, y);
            return { node, offset, boundingRect: rect };
          }
        }
      } while ((node = walker.nextNode()));

      if (!startNode) {
        return { node: nearestFirstNode, offset: 0, boundingRect: null };
      } else {
        return {
          node: nearestLastNode,
          offset: nearestLastNode.length,
          boundingRect: null,
        };
      }
    }
  } catch (error) {
    renderErrorPopup("CopyIn2Clicks not Supported for Chosen Text!");
    console.error("Error in findTextNodeFromPoint:", error);
  }
  return null;
}

function getTextOffsetInNode(range, x, y) {
  const length = range.endOffset;
  for (let i = 0; i < length; i++) {
    range.setStart(range.startContainer, i);
    range.setEnd(range.startContainer, i + 1);
    const rect = range.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return i;
    }
  }
  return 0;
}
