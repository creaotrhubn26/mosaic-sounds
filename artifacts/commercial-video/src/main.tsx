import { createRoot } from "react-dom/client";
import App from "./App";
import App916 from "./App916";
import "./index.css";

const is916 = new URLSearchParams(window.location.search).get("v") === "916";

createRoot(document.getElementById("root")!).render(is916 ? <App916 /> : <App />);
