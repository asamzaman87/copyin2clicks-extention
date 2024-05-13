import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://*/*", "https://*/*"],
  all_frames: true
}

let startNode = null
let endNode = null
let selectedText = ""
let startIconNode;
let isSelectionCompleted = false

document.addEventListener("click", function (event) {
  chrome.storage.local.get("isOn", function (result) {
    if (
      result.isOn == ("true" || true) &&
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
          selectTextBetween()
          setTimeout(() => {
            addEndIcon(event.clientX, event.clientY, event.pageX, event.pageY)
          }, 100)
        }
      } else {
        if (isSelectionCompleted) {
          resetAll()
        }
      }
    }
  })
})

function addStartIcon(x: any, y: any, pageX: any, pageY: any) {
  let endIcon = document.querySelector("#copyEndingIcon")
  if (endIcon) return
  let selectionIcons = document.querySelectorAll("#copyStartingIcon")
  if (selectionIcons)
    selectionIcons.forEach((selectionIcon) => selectionIcon.remove())
  let startIcon = document.createElement("span")
  startIcon.id = "copyStartingIcon"
  const startFontSize = getFontSizeAtPoint(x, y);
  startIcon.textContent = "["
  startIcon.style.position = "absolute"
  startIcon.style.zIndex = "99999999999999"
  startIcon.style.backgroundColor = "yellow"
  startIcon.style.color = "brown"
  startIcon.style.fontSize = startFontSize
  startIcon.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  startIcon.style.cursor = "pointer"
  startIcon.style.left = `${pageX}px`
  startIcon.style.top = `${pageY}px`
  startIconNode = startIcon
  // document.body.appendChild(startIconNode)
   //Start
   const selectedRange = window.getSelection().getRangeAt(0);
   const selectedText = selectedRange.toString();
   const startBracket = "[";
  //  const endBracket = "]";
   const newText = startBracket + selectedText;
  //  const newText =  selectedText + endBracket;
 
   selectedRange.deleteContents();
   selectedRange.insertNode(document.createTextNode(newText));
 
   //End
  // startIcon.remove()
  // startNode = findTextNodeFromPoint(x, y)
  startIcon.onclick = async () => {
    // console.log({ startNode })
  }
}

async function addEndIcon(x: any, y: any, pageX: any, pageY: any) {
  let selectionIcons = document.querySelectorAll("#copyEndingIcon")
  if (selectionIcons)
    selectionIcons.forEach((selectionIcon) => selectionIcon.remove())

  let rect;
  const selection = window.getSelection();
  console.log("selection121212", selection)
  if (selection.rangeCount > 0) {

    const range = selection.getRangeAt(0);
    rect = range.getBoundingClientRect();
    console.log(rect?.left + window?.scrollX, rect?.top + window?.scrollY, "IOPIO", range?.endOffset, range?.startOffset)
    const startNode = range.startContainer;
    const startOffset = range.startOffset;

    // const endNode = range.endContainer;
    // const endOffset = range.endOffset;
  }

  let endIcon = document.createElement("span")
  endIcon.id = "copyEndingIcon"
  const endFontSize = getFontSizeAtPoint(x, y);
  endIcon.style.borderRadius = "6px"
  endIcon.textContent = "]"
  endIcon.style.position = "absolute"
  endIcon.style.zIndex = "99999999999999"
  endIcon.style.backgroundColor = "yellow"
  endIcon.style.color = "brown"
  endIcon.style.fontSize = endFontSize
  endIcon.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  endIcon.style.cursor = "pointer"
  // endIcon.style.left = `${rect?.left + window?.scrollX }px`
  // endIcon.style.top = `${rect?.top + window?.scrollY}px`
  endIcon.style.left = `${pageX}px`
  endIcon.style.top = `${pageY}px`
  // document.body.appendChild(endIcon)


  //Start
  const selectedRange = window.getSelection().getRangeAt(0);
  const selectedText = selectedRange.toString();
  // const startBracket = "[";
  const endBracket = "]";
  // const newText = startBracket + selectedText + endBracket;
  const newText =  selectedText + endBracket;

  selectedRange.deleteContents();
  selectedRange.insertNode(document.createTextNode(newText));

  //End

  startNode = null
  endNode = null
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
    alert("Text successfully copied and stored!")
    isSelectionCompleted = true
  })
}

function removeIcons() {
  document.getElementById("copyStartingIcon")?.remove()
  document.getElementById("copyEndingIcon")?.remove()
}

function resetAll() {
  startNode = null
  endNode = null
  selectedText = ""
  startIconNode;
  let selectionIcons = document.querySelectorAll("#copyEndingIcon")
  let selectionStartIcons = document.querySelectorAll("#copyStartingIcon")
  if (selectionIcons)
    selectionIcons.forEach((selectionIcon) => selectionIcon.remove())
  if (selectionStartIcons)
    selectionStartIcons.forEach((selectionIcon) => selectionIcon.remove())
}

function getFontSizeAtPoint(x, y) {
  const elem = document.elementFromPoint(x, y);
  return window.getComputedStyle(elem).fontSize;
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

  // console.log({ startNode, endNode })
  if (startNode && endNode && startNode.node && endNode.node) {
    const startDomNode = startNode.node
    const endDomNode = endNode.node
    // console.log({ startDomNode, endDomNode })

    // Determine the correct document order
    const documentOrder = startDomNode.compareDocumentPosition(endDomNode)
    // console.log({ documentOrder })
    const isStartBeforeEnd =
      documentOrder == Node.DOCUMENT_POSITION_FOLLOWING ||
      (documentOrder == 0 && startNode.offset < endNode.offset) ||
      // (documentOrder == 2 && startNode.offset < endNode.offset) ||
      (documentOrder == 20 && startNode.offset < endNode.offset)

    if (isStartBeforeEnd) {
      range.setStart(startDomNode, startNode.offset)
      range.setEnd(endDomNode, endNode.offset)
    } else {
      range.setStart(endDomNode, endNode.offset)
      range.setEnd(startDomNode, startNode.offset)
    }
    console.log({ range })
    selection.addRange(range) // Add the new range to the current selection
    selectedText = range.toString()
    // console.log(selection.toString())
  } else {
    console.log("Invalid start or end node for selection")
  }
}
