import { createRoot } from "react-dom/client";
import { App } from "./App";
import './i18n';
console.log('🚀 Renderer entry point loaded');
createRoot(document.getElementById("root")!).render(<App />);
