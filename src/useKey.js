import { useEffect } from "react";
export const useKey = (action, key) => {
  //Listen to global escape keypress using useEffect

  useEffect(() => {
    const keyListener = (e) => {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        console.log("inside key listener: ", key);
        action?.();
      }
    };
    document.addEventListener("keydown", keyListener);

    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [action, key]);
};
