import "./font.css";
import "./styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Providers from "@/components/Common/Providers";
import Routes from "./routes";

createRoot(document.getElementById("_palus_") as HTMLElement).render(
  <StrictMode>
    <Providers>
      <Routes />
    </Providers>
  </StrictMode>
);
