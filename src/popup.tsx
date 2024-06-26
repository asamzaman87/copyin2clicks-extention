import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import Container from "~components/Container";
import Footer from "~components/Footer";
import Header from "~components/Header";
import Tooltip from "~components/Tooltip";
import "~style.css";

function IndexPopup() {
  const storage = new Storage({ area: "local" });
  const [error, setError] = useState(null);
  const [alert, setAlert] = useStorage({ key: "alert", instance: storage }, "");
  const [userData, setUserData] = useState([]);

  // const fetchUserData = () => {
  //   chrome.storage.sync.get( function (items) {
  //     chrome.runtime.sendMessage(
  //       { action: "fetchUserData" },
  //       function (response) {
  //         if (response.error) {
  //           setError(response.error);
  //           setUserData(null);
  //         } else {
  //           setError(null);
  //           console.log('response', response)
  //           setUserData(response);
  //         }
  //       }
  //     );
  //   });
  // };
  // useEffect(() => {
  //   setAlert("");
  //   fetchUserData();
  // }, []);

  const fetchUserData = () => {
    chrome.storage.sync.get("userData", (result) => {
      if (result.userData) {
        setUserData(result.userData);
      } else {
        chrome.runtime.sendMessage({ action: "fetchUserData" }, (response) => {
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message);
            setUserData(null);
          } else if (response.error) {
            setError(response.error);
            setUserData(null);
          } else {
            setError(null);
            setUserData(response);
            chrome.storage.sync.set({ userData: response });
          }
        });
      }
    });
  };

  useEffect(() => {
    setAlert("");
    fetchUserData();

    const handleStorageChange = (changes, areaName) => {
      if (areaName === "sync" && changes.userData) {
        setUserData(changes.userData.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return (
    <>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <div className="w-[450px] min-h-[100px] max-h-[450px]">
        <Header userData={userData} />
        <main className="p-2">
          <Container userData={userData} />
          <Footer userData={userData} />
        </main>
        {alert && <Tooltip text={alert} />}
      </div>
    </>
  );
}

export default IndexPopup;
