import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [locale, setLocale] = useState();

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale?.substring(0, 2) + i18nlocale?.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const lightTheme = createTheme(
    {
      scrollbarStyles: {
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#e8e8e8',
        },
      },
      palette: {
        type: 'light',
        primary: { 
          main: '#151515',
          contrastText: '#ffffff'
        },
        secondary: { 
          main: '#f50057',
          contrastText: '#ffffff'
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
        text: {
          primary: '#151515',
          secondary: '#666666',
        },
        danger: { main: '#525252' },
      },
      overrides: {
        MuiAppBar: {
          root: {
            backgroundColor: '#151515',
            color: '#ffffff',
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: '#151515',
            color: '#ffffff',
          },
        },
        MuiListItem: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        MuiListItemIcon: {
          root: {
            color: '#ffffff',
          },
        },
        MuiListItemText: {
          primary: {
            color: '#ffffff',
          },
        },
        MuiDivider: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        MuiListSubheader: {
          root: {
            backgroundColor: '#151515',
            color: '#ffffff',
          },
        },
        MuiIconButton: {
          root: {
            color: '#ffffff',
          },
        },
      },
    },
    locale
  );

  const darkTheme = createTheme(
    {
      scrollbarStyles: {
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#555555',
        },
      },
      palette: {
        type: 'dark',
        primary: { 
          main: '#bb86fc',
          contrastText: '#000000'
        },
        secondary: { 
          main: '#03dac6',
          contrastText: '#000000'
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#aaaaaa',
        },
        danger: { main: '#cf6679' },
      },
      overrides: {
        MuiAppBar: {
          root: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
        MuiPaper: {
          root: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
        MuiListItem: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        MuiListItemIcon: {
          root: {
            color: '#ffffff',
          },
        },
        MuiListItemText: {
          primary: {
            color: '#ffffff',
          },
        },
        MuiDivider: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        MuiListSubheader: {
          root: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
        MuiIconButton: {
          root: {
            color: '#ffffff',
          },
        },
      },
    },
    locale
  );

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};