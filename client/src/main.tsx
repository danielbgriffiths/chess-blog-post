import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { WebSocketProvider } from "./context/web-socket/provider";
import { Toast } from "./components/toast";
import { router } from "./router";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <RouterProvider router={router} />
      <Toast />
    </WebSocketProvider>
  </React.StrictMode>,
);
