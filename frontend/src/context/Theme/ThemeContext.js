import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme } from "@material-ui/core/styles";
import { ptBR } from "@material-ui/core/locale";

const ThemeContext = createContext();

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useCustomTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [locale, setLocale] = useState();

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
    
    const savedDrawerState = localStorage.getItem("drawerCollapsed");
    if (savedDrawerState) {
      setDrawerCollapsed(JSON.parse(savedDrawerState));
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
    
    // Recarrega a página quando desativar o modo noturno (dark -> light)
    if (darkMode && !newDarkMode) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const toggleDrawerCollapse = () => {
    const newDrawerCollapsed = !drawerCollapsed;
    setDrawerCollapsed(newDrawerCollapsed);
    localStorage.setItem("drawerCollapsed", JSON.stringify(newDrawerCollapsed));
  };

  const lightTheme = createTheme(
    {
      typography: {
        fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h2: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h3: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h4: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h5: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h6: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        subtitle1: {
          fontWeight: 600,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        subtitle2: {
          fontWeight: 600,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        button: {
          fontWeight: 600,
          textTransform: 'none',
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
      },
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
        MuiTab: {
          root: {
            fontWeight: 700,
            textTransform: 'none',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiAppBar: {
          root: {
            backgroundColor: '#151515 !important',
            color: '#ffffff !important',
            '& .MuiIconButton-root': {
              color: '#ffffff !important',
            },
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: '#151515 !important',
            color: '#ffffff !important',
            '& .MuiListItem-root': {
              color: '#ffffff !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
              },
            },
            '& .MuiListItemIcon-root': {
              color: '#ffffff !important',
              minWidth: '40px',
            },
            '& .MuiListItemText-primary': {
              color: '#ffffff !important',
              fontWeight: 500,
            },
            '& .MuiDivider-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
            },
            '& .MuiListSubheader-root': {
              backgroundColor: '#151515 !important',
              color: '#ffffff !important',
            },
            '& .MuiIconButton-root': {
              color: '#ffffff !important',
            },
          },
        },
        // Remover overrides globais para permitir cores padrão no conteúdo
        MuiPaper: {
          root: {
            backgroundColor: '#ffffff',
            color: '#151515',
          },
          outlined: {
            border: 'none !important',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1) !important',
            borderRadius: '12px !important',
          },
        },
        MuiTypography: {
          root: {
            color: '#151515',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 700,
          },
          h4: {
            fontWeight: 700,
          },
          h5: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 700,
          },
        },
        MuiButton: {
          root: {
            color: '#151515',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        MuiIconButton: {
          root: {
            color: '#151515',
          },
        },
        MuiTableCell: {
          root: {
            color: '#151515',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
          head: {
            fontWeight: 600,
          },
        },
        MuiTableHead: {
          root: {
            backgroundColor: '#f5f5f5',
          },
        },
        MuiTextField: {
          root: {
            '& .MuiInputBase-root': {
              color: '#151515',
              fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
              fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
              fontWeight: 500,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cccccc',
            },
          },
        },
        MuiPopover: {
          paper: {
            backgroundColor: '#ffffff',
            color: '#151515',
          },
        },
        MuiMenuItem: {
          root: {
            color: '#151515',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
        MuiDialogTitle: {
          root: {
            fontWeight: 700,
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiCardHeader: {
          title: {
            fontWeight: 700,
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiSvgIcon: {
          root: {
            color: 'inherit',
          },
        },
      },
    },
    locale
  );

  const darkTheme = createTheme(
    {
      typography: {
        fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h2: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h3: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h4: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h5: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        h6: {
          fontWeight: 700,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        subtitle1: {
          fontWeight: 600,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        subtitle2: {
          fontWeight: 600,
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
        button: {
          fontWeight: 600,
          textTransform: 'none',
          fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
        },
      },
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
        MuiTab: {
          root: {
            fontWeight: 700,
            textTransform: 'none',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiCssBaseline: {
          '@global': {
            body: {
              backgroundColor: '#121212',
              color: '#ffffff',
              fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            },
          },
        },
        MuiAppBar: {
          root: {
            backgroundColor: '#1e1e1e !important',
            color: '#ffffff !important',
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: '#1e1e1e !important',
            color: '#ffffff !important',
          },
        },
        MuiPaper: {
          root: {
            backgroundColor: '#1e1e1e !important',
            color: '#ffffff !important',
          },
          outlined: {
            border: 'none !important',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3) !important',
            borderRadius: '12px !important',
          },
        },
        MuiListItem: {
          root: {
            color: '#ffffff !important',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(187, 134, 252, 0.1) !important',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(187, 134, 252, 0.2) !important',
            },
          },
        },
        MuiListItemIcon: {
          root: {
            color: '#ffffff !important',
            minWidth: '40px',
          },
        },
        MuiListItemText: {
          primary: {
            color: '#ffffff !important',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            fontWeight: 500,
          },
        },
        MuiDivider: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
          },
        },
        MuiListSubheader: {
          root: {
            backgroundColor: '#1e1e1e !important',
            color: '#ffffff !important',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiIconButton: {
          root: {
            color: '#ffffff !important',
          },
        },
        MuiTextField: {
          root: {
            '& .MuiInputBase-root': {
              color: '#ffffff',
              fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            },
            '& .MuiInputLabel-root': {
              color: '#aaaaaa',
              fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
              fontWeight: 500,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#555555',
            },
          },
        },
        MuiTableCell: {
          root: {
            color: '#ffffff !important',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2) !important',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
          head: {
            fontWeight: 600,
          },
        },
        MuiTableHead: {
          root: {
            backgroundColor: '#2a2a2a !important',
          },
        },
        MuiButton: {
          root: {
            color: '#ffffff',
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        MuiTypography: {
          root: {
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 700,
          },
          h4: {
            fontWeight: 700,
          },
          h5: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 700,
          },
        },
        MuiMenuItem: {
          root: {
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiDialogTitle: {
          root: {
            fontWeight: 700,
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiCardHeader: {
          title: {
            fontWeight: 700,
            fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
          },
        },
        MuiSvgIcon: {
          root: {
            color: 'inherit',
          },
        },
      },
    },
    locale
  );

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      theme, 
      drawerCollapsed, 
      toggleDrawerCollapse 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};