import React, { useEffect, useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { NOEXTENTION, INVALID_EXTENSION } from "src/utils/constants";
import Tooltip from "./Tooltip";
import { FaUserPlus } from "react-icons/fa";

const validExtensions = [
  "txt",
  "doc",
  "pdf",
  "csv",
  "xml",
  "html",
  "xhtml",
  "css",
  "js",
  "jsx",
  "json",
  "yaml",
  "yml",
  "log",
  "md",
  "rtf",
  "ini",
  "cfg",
  "sql",
  "sh",
  "py",
  "java",
  "c",
  "cpp",
  "cs",
  "php",
  "pl",
  "rb",
  "docx",
  "odt",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
];

function Footer({ userData }) {
  const [extension, setExtension] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const storage = new Storage({ area: "local" });
  let [txt, setTxt] = useStorage({ key: "extension", instance: storage }, "");
  const [toolTip, setToolTip] = useStorage(
    { key: "alert", instance: storage },
    ""
  );

  useEffect(() => {
    setExtension(txt);
  }, [txt]);

  function isValidExtension(ext) {
    return validExtensions.includes(ext);
  }

  function setExtensionFunc(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value.trim().toLowerCase();
    if (newValue === "") {
      setTxt(""); // Clear the storage value if input is empty
      setExtension(""); // Clear the extension value
    } else {
      setExtension(newValue);
      onSave(newValue);
    }
  }

  function onSave(ext) {
    if (!ext) {
      setToolTip(NOEXTENTION);
      setShowTooltip(true);
    } else if (!isValidExtension(ext)) {
      setToolTip(
        `${INVALID_EXTENSION} E.g: ${validExtensions.slice(0, 5).join(", ")}.`
      );
      setShowTooltip(true);
    } else {
      setTxt(ext);
      handleAlert(ext);
    }
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 1000);
  }

  function handleAlert(ext) {
    setToolTip(`File Extension Set to .${ext}!`);
    setShowTooltip(true);
    setTimeout(() => {
      setToolTip("");
      setShowTooltip(false);
    }, 1000);
  }

  return (
    <div className="p-2 pb-0 flex justify-center">
      {/* <div className="flex justify-start items-center gap-2">
        <FaUserPlus className="text-blue-400" size={25} />
        <span className="text-sm font-semibold">
          {userData?.name || "Login"}
        </span>
      </div> */}
      <div className="flex gap-1">
        <select
          className={`${extension ? "w-24" : "w-40"} text-center p-1.5 border text-sm font-semibold text-black border-black rounded-md  no-focus-outline select-custom`}
          value={extension}
          onChange={setExtensionFunc}
        >
          <option value="">Select Extension</option>
          {validExtensions?.map((ext) => (
            <option key={ext} value={ext}>
              {ext}
            </option>
          ))}
        </select>
      </div>
      {showTooltip && <Tooltip text={toolTip} />}
    </div>
  );
}

export default Footer;
