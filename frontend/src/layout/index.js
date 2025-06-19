import React, { useState, useContext, useEffect } from "react";
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AccountCircle from "@material-ui/icons/AccountCircle";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import { useCustomTheme } from "../context/Theme/ThemeContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import logo from "../assets/logo.png"; 
import { socketConnection } from "../services/socket";

const drawerWidth = 300;
const drawerCollapsedWidth = 100;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
  },

  toolbar: {
    paddingRight: 24,
    paddingLeft: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: "#ffffff !important",
    color: "#000000 !important",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "& .MuiIconButton-root": {
      color: "#000000 !important",
    },
    "& .MuiTypography-root": {
      color: "#000000 !important",
    },
  },
  menuButton: {
    marginRight: 16,
    display: "none", // Esconder o botão do header
  },
  title: {
    flexGrow: 1,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 500,
  },
  userNameTag: {
    backgroundColor: '#44b774',
    color: '#f5fff5',
    padding: '1px 15px',
    borderRadius: '50px',
    display: 'inline-block',
    fontWeight: 'normal',
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: drawerCollapsedWidth,
  },
  drawerCollapsed: {
    width: drawerCollapsedWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    backgroundColor: "#ffffff !important",
    borderRadius: "50px !important",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08) !important",
    border: "none !important",
    margin: "16px",
    height: "calc(100vh - 96px)",
    marginTop: "80px",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    "& .MuiListItem-root": {
      color: "#666666 !important",
      margin: "4px 16px",
      borderRadius: "25px !important",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.04) !important",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(0,0,0,0.08) !important",
      },
    },
    "& .MuiListItemIcon-root": {
      color: "#666666 !important",
      minWidth: "40px",
    },
    "& .MuiListItemText-primary": {
      color: "#666666 !important",
    },
    "& .MuiDivider-root": {
      backgroundColor: "rgba(0,0,0,0.08) !important",
      margin: "8px 16px",
    },
    "& .MuiListSubheader-root": {
      backgroundColor: "transparent !important",
      color: "#999999 !important",
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    "& .MuiIconButton-root": {
      color: "#666666 !important",
    },
  },
  drawerPaperClose: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerCollapsedWidth,
    backgroundColor: "#ffffff !important",
    borderRadius: "50px !important",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08) !important",
    border: "none !important",
    margin: "16px",
    height: "calc(100vh - 96px)",
    marginTop: "80px",
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    "& .MuiListItem-root": {
      color: "#666666 !important",
      margin: "4px 0",
      borderRadius: "25px !important",
      display: "flex !important",
      justifyContent: "center !important",
      alignItems: "center !important",
      minHeight: "48px",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.04) !important",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(0,0,0,0.08) !important",
      },
    },
    "& .MuiListItemIcon-root": {
      color: "#666666 !important",
      minWidth: "auto !important",
      margin: "0 !important",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
    },
    "& .MuiDivider-root": {
      backgroundColor: "rgba(0,0,0,0.08) !important",
      margin: "8px 16px",
    },
    "& .MuiIconButton-root": {
      color: "#666666 !important",
    },
  },
  drawerPaperCollapsed: {
    position: "relative",
    whiteSpace: "nowrap",
    width: 72,
    backgroundColor: "#ffffff !important",
    borderRadius: "50px !important",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08) !important",
    border: "none !important",
    margin: "16px",
    height: "calc(100vh - 96px)",
    marginTop: "80px",
    overflowX: "hidden",
    overflowY: "auto",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    "& .MuiListItem-root": {
      color: "#666666 !important",
      margin: "4px 0",
      borderRadius: "25px !important",
      display: "flex !important",
      justifyContent: "center !important",
      alignItems: "center !important",
      minHeight: "48px",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.04) !important",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(0,0,0,0.08) !important",
      },
    },
    "& .MuiListItemIcon-root": {
      color: "#666666 !important",
      minWidth: "auto !important",
      margin: "0 !important",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
    },
    "& .MuiDivider-root": {
      backgroundColor: "rgba(0,0,0,0.08) !important",
      margin: "8px 16px",
    },
    "& .MuiIconButton-root": {
      color: "#666666 !important",
    },
  },
  appBarSpacer: {
    minHeight: "64px",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: "auto",
    ...theme.scrollbarStyles,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  containerWithScroll: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "auto",
    overflowX: "hidden",
    // Esconder scrollbar completamente
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&::-webkit-scrollbar-track": {
      display: "none",
    },
    "&::-webkit-scrollbar-thumb": {
      display: "none",
    },
    // Para Firefox
    scrollbarWidth: "none",
    // Para IE e Edge
    msOverflowStyle: "none",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
    minHeight: "48px !important",
  },
  expandButton: {
    color: "#666666 !important",
    margin: "8px",
  },
}));

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const { drawerCollapsed, toggleDrawerCollapse } = useCustomTheme();

  const theme = useTheme();
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 4 && hour < 12) {
      return "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={classes.appBar}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <div className={classes.logoContainer}>
            <img 
              src={logo} 
              style={{ 
                height: '50px', 
                width: '50px',
              }} 
              alt="logo"
            />
          </div>
          
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {greaterThenSm ? (
              <>
                {getGreeting()}, <span className={classes.userNameTag}>{user.name}</span>
              </>
            ) : (
              <span className={classes.userNameTag}>{user.name}</span>
            )}
          </Typography>

          <div className={classes.rightSection}>
            {user.id && <NotificationsPopOver />}
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              variant="contained"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={drawerVariant}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: !drawerCollapsed,
          [classes.drawerClose]: drawerCollapsed,
        })}
        classes={{
          paper: clsx({
            [classes.drawerPaper]: !drawerCollapsed,
            [classes.drawerPaperCollapsed]: drawerCollapsed,
          }),
        }}
        open={drawerOpen}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton 
            onClick={toggleDrawerCollapse}
            className={classes.expandButton}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List className={classes.containerWithScroll}>
          <MainListItems drawerClose={drawerClose} drawerCollapsed={drawerCollapsed} />
        </List>
      </Drawer>
      
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;