import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "bytemd/dist/index.css";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

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
