import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://*/*", "https://*/*"],
  all_frames: true
}

let startNode = null
let endNode = null
let selectedText = ""
let isSelectionCompleted = false
const bracketsElementClass = "copy-in-click-ext-bracket"
let blinkingInterval;

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
    }, 300)
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
  const primaryColor = '#3c82f6'
  const buttonStyles = `border:1px solid ${primaryColor};border-radius:6px;padding:4px 40px;background:${primaryColor};color:white;cursor:pointer;font-weight:bold;`
  popup.innerHTML = `
      <div>
        <div style="display:flex;justify-content:center;padding:8px;padding-bottom:0;" >
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="0 0 256 256" xml:space="preserve">
          <defs>
          </defs>
          <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
            <polygon points="37.95,64.44 23.78,50.27 30.85,43.2 37.95,50.3 59.15,29.1 66.22,36.17 " style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,158,4); fill-rule: nonzero; opacity: 1;" transform="  matrix(1 0 0 1 0 0) "/>
            <path d="M 45 90 C 20.187 90 0 69.813 0 45 C 0 20.187 20.187 0 45 0 c 24.813 0 45 20.187 45 45 C 90 69.813 69.813 90 45 90 z M 45 10 c -19.299 0 -35 15.701 -35 35 s 15.701 35 35 35 s 35 -15.701 35 -35 S 64.299 10 45 10 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,158,4); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
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
}

document.addEventListener("click", function (event) {
  chrome.storage.local.get("isOn", function (result) {
    if (
      result.isOn ||
      result.isOn == "true" &&
      result.isOn != "false"
    ) {
      if (event.altKey) {
        if (isSelectionCompleted) {
          isSelectionCompleted = false
          resetAll()
        }
        if (!startNode) {
          console.log("start")
          startNode = findTextNodeFromPoint(event.clientX, event.clientY)
          addStartIcon(event.clientX, event.clientY, event.pageX, event.pageY)
        } else if (startNode) {
          console.log("end")
          endNode = findTextNodeFromPoint(event.clientX, event.clientY)
          addEndIcon(event.clientX, event.clientY, event.pageX, event.pageY)
          selectTextBetween()
        }
      } else {
        console.log("RESETTED!")
        // if (isSelectionCompleted) {
        resetAll()
        // }
      }
    }
  })
})

function addStartIcon(x: any, y: any, pageX: any, pageY: any) {
  insertBrackets("[")
}

function addEndIcon(x: any, y: any, pageX: any, pageY: any) {
  insertBrackets("]")
  setTimeout(() => saveCopiedText(), 500)
}


async function saveCopiedText() {
  chrome.storage.local.get(["recentlyCopiedItems"], async (result) => {
    let items = result?.recentlyCopiedItems || "[]"
    items = Array.from(JSON.parse(items))
    if (selectedText === "") return
    items.unshift(selectedText)
    items = items.length > 10 ? items.slice(0, 10) : items
    await chrome.storage.local.set({
      recentlyCopiedItems: JSON.stringify(items)
    })
    await navigator.clipboard.writeText(selectedText)
    isSelectionCompleted = true
    // resetAll()
    setTimeout(() => renderPopup(), 500)
  })
}

function insertBrackets(textContent: string) {
  const selectedRange = window.getSelection().getRangeAt(0);
  const startBracket = document.createElement("span");
  startBracket.classList.add(bracketsElementClass);
  // startBracket.style.animation = 'fading 2s infinite';
  startBracket.textContent = textContent;
  if (textContent === '[') {
    selectedRange.deleteContents();
  } else {
    selectedRange.collapse(false); // Move cursor to the end of selection
  }
  selectedRange.insertNode(startBracket);
  var visible = true;
  blinkingInterval = setInterval(function () {
    startBracket.style.opacity = visible ? "0.2" : "1";
    visible = !visible;
  }, 600);
}

function resetAll() {
  startNode = null
  endNode = null
  selectedText = ""
  let bracket = document.querySelectorAll(`.${bracketsElementClass}`)
  if (bracket)
    bracket.forEach((bracket) => bracket.remove())
  clearInterval(blinkingInterval);
}

function findTextNodeFromPoint(x: any, y: any) {
  const elem = document.elementsFromPoint(x, y)
  // console.log({ elem })
  if (!elem) {
    return null
  }

  const walker = document.createTreeWalker(elem[0], NodeFilter.SHOW_TEXT, null)
  let foundNode = null
  let node: any = walker.nextNode() // Ensure correct initialization
  let nearestFirstNode = null
  let nearestLastNode = null
  do {
    const range = document.createRange()
    range.selectNodeContents(node)

    // Check if range covers the click point relative to the element
    const rects = range.getClientRects() // Assuming single text node per rect
    if (rects.length > 0) {
      if (!nearestFirstNode) {
        nearestFirstNode = node
      }
      nearestLastNode = node
    }
    // console.log({ rects, x, y, node })
    for (const rect of rects) {
      if (
        x >= rect?.left &&
        x <= rect?.right &&
        y >= rect?.top &&
        y <= rect?.bottom
        // true
      ) {
        const offset = getTextOffsetInNode(range, x, y)
        foundNode = { node, offset, boundingRect: rect }
        return foundNode
        break
      }
    }
  } while ((node = walker.nextNode()))

  if (!startNode) {
    return { node: nearestFirstNode, offset: 0, boundingRect: null }
  } else {
    return { node: nearestLastNode, offset: nearestLastNode.length, boundingRect: null }
  }
}

function getTextOffsetInNode(range: any, x: any, y: any) {
  const length = range.endOffset
  for (let i = 0; i < length; i++) {
    range.setStart(range.startContainer, i)
    range.setEnd(range.startContainer, i + 1)
    const rect = range.getBoundingClientRect()
    // console.log(rect)

    if (
      x >= rect?.left &&
      x <= rect?.right &&
      y >= rect?.top &&
      y <= rect?.bottom
    ) {
      return i
    } else {
      // console.log("not found")
    }
  }

  return 0
}

function selectTextBetween() {
  const range = document.createRange()
  const selection = window.getSelection()
  selection.removeAllRanges() // Clear existing selections
  if (startNode && endNode && startNode.node && endNode.node) {
    const startDomNode = startNode.node
    const endDomNode = endNode.node
    // Determine the correct document order
    const documentOrder = startDomNode.compareDocumentPosition(endDomNode)
    const isStartBeforeEnd =
      documentOrder == Node.DOCUMENT_POSITION_FOLLOWING ||
      (documentOrder == 0 && startNode.offset < endNode.offset) ||
      (documentOrder == 20 && startNode.offset < endNode.offset)

    if (isStartBeforeEnd) {
      // Set start offset to the first character after '[' bracket
      const startOffset = startNode.node.textContent.indexOf("[") + 1;
      range.setStart(startDomNode, startNode.offset + startOffset)
      range.setEnd(endDomNode, endNode.offset)
    } else {
      // Set start offset to the first character after '[' bracket
      const startOffset = endNode.node.textContent.indexOf("[") + 1;
      range.setStart(endDomNode, endNode.offset + startOffset)
      range.setEnd(startDomNode, startNode.offset)
    }
    console.log({ range })
    selection.addRange(range) // Add the new range to the current selection
    selectedText = removeBracketAndContentWithin10Chars(range.toString());
  } else {
    console.log("Invalid start or end node for selection")
  }
}

function removeBracketAndContentWithin10Chars(text: string) {
  // Define a regular expression pattern to match the first "[" and the content before it within 10 characters
  var pattern = /^(.{0,20}?)\[/;

  // Use replace() method to substitute the matched pattern with the captured group
  var result = text.replace(pattern, '');
  return result.trim();
}

