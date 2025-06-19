import React from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider, useCustomTheme } from "./context/Theme/ThemeContext";

// Import custom CSS after Material-UI components to ensure proper override
import "./assets/css/custom-paper-styles.css";
import "./assets/css/font-override.css";

const AppContent = () => {
	const { theme } = useCustomTheme();

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<Routes />
		</MuiThemeProvider>
	);
};

const App = () => {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
};

export default App;