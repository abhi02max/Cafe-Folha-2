import React from "react";
import { createRoot } from "react-dom/client";
import Home from "../../app/page";
import "../../app/globals.css";
import "./preview.css";

const nativeFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith("/api/") || url.includes(`${window.location.origin}/api/`)) {
    return Promise.resolve(
      new Response(
        JSON.stringify({ error: "This is a visual client preview. Live submissions are disabled." }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      ),
    );
  }
  return nativeFetch(input, init);
};

function PreviewApp() {
  return (
    <>
      <div className="preview-ribbon" role="status">
        <span>CLIENT REVIEW</span>
        <strong>Visual preview · live submissions are off</strong>
      </div>
      <Home />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>,
);
