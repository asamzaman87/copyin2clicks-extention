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
  const [text,setText] = useState('Alt/Option')

  const [selectedKeyCombination, setSelectedKeyCombination] = useStorage(
    { key: "key", instance: new Storage({ area: "local" }) },
    "altKey"
  );

  // const fetchUserData = () => {
  //   chrome.storage.sync.get("userData", (result) => {
  //     console.log('resultresultresult', result)
  //     if (result.userData) {
  //       setUserData(result.userData);
  //     } else {
  //       chrome.runtime.sendMessage({ action: "fetchUserData" }, (response) => {
  //         if (chrome.runtime.lastError) {
  //           setError(chrome.runtime.lastError.message);
  //           setUserData(null);
  //         } else if (response.error) {
  //           setError(response.error);
  //           setUserData(null);
  //         } else {
  //           setError(null);
  //           setUserData(response);
  //           chrome.storage.sync.set({ userData: response });
  //         }
  //       });
  //     }
  //   });
  // };

  const getUserDataFromStorage = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get("userData", (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.userData);
        }
      });
    });
  };
  
  const fetchUserData = async () => {
    try {
      const userData = await getUserDataFromStorage();
      if (userData) {
        setUserData(userData);
      } else {
        throw new Error('No userData found');
      }
    } catch (storageError) {
      console.log('Storage error:', storageError);
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

  const handleKeyCombinationChange = (e) => {
    setSelectedKeyCombination(e.target.value);
  };

  useEffect(() => {
    if(selectedKeyCombination === 'altKey') {
      setText('Alt/Option');
    } else if(selectedKeyCombination === 'metaKey') {
      setText('Command/Window');
    }
  }, [selectedKeyCombination]);

  return (
    <>
  
      <div className="w-[450px] min-h-[100px] max-h-[450px]">
        <Header userData={userData} selectedKeyCombination={selectedKeyCombination}  handleKeyCombinationChange={handleKeyCombinationChange} />
        <main className="p-2">
          <Container userData={userData}  text={text}/>
          <Footer userData={userData} />
        </main>
        {alert && <Tooltip text={alert} />}
      </div>
    </>
  );
}

export default IndexPopup;
