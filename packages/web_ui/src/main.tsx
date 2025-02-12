import { App } from "@src/containers/app"
import React from "react"

import ReactDOM from "react-dom/client"
import "normalize.css"
import "@src/base.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
