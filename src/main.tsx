import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "bytemd/dist/index.css";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

document.addEventListener(
  "contextmenu",
  (e) => {
    const target = e.target as HTMLElement;

    const allowContextMenu = ["img"];

    if (allowContextMenu.includes(target.tagName.toLowerCase())) {
      return true;
    }

    e.preventDefault();
    return false;
  },
  false
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      await registration.update();
    } catch (err) {
      console.error("ServiceWorker registration failed:", err);
    }
  });
}
