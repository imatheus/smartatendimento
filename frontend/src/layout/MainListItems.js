import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List, Popover, MenuList, MenuItem } from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import ChatOutlinedIcon from "@material-ui/icons/ChatOutlined";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import OfflineBoltOutlinedIcon from "@material-ui/icons/OfflineBoltOutlined";
import AndroidOutlinedIcon from "@material-ui/icons/AndroidOutlined";
import AccountBalanceOutlinedIcon from "@material-ui/icons/AccountBalanceOutlined";
import PowerOutlinedIcon from "@material-ui/icons/PowerOutlined";
import LocalOfferOutlinedIcon from "@material-ui/icons/LocalOfferOutlined";
import VolumeUpOutlinedIcon from "@material-ui/icons/VolumeUpOutlined";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import moment from "moment";

function ListItemLink(props) {
  const { icon, primary, to, className, drawerCollapsed, disabled = false } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={disabled ? "#" : to} ref={ref} {...itemProps} />
      )),
    [to, disabled]
  );

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
    }
  };

  return (
    <li>
      <ListItem 
        button 
        component={disabled ? "div" : renderLink} 
        className={className}
        title={drawerCollapsed ? (disabled ? `${primary} (Bloqueado)` : primary) : ""}
        onClick={handleClick}
        style={{ 
          justifyContent: drawerCollapsed ? 'center' : 'flex-start',
          paddingLeft: drawerCollapsed ? 16 : 16,
          paddingRight: drawerCollapsed ? 16 : 16,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        {icon ? <ListItemIcon style={{ 
          minWidth: drawerCollapsed ? 'auto' : '40px',
          opacity: disabled ? 0.5 : 1 
        }}>{icon}</ListItemIcon> : null}
        {!drawerCollapsed && <ListItemText 
          primary={disabled ? `${primary} (Bloqueado)` : primary} 
          style={{ opacity: disabled ? 0.5 : 1 }}
        />}
      </ListItem>
    </li>
  );
}


const MainListItems = (props) => {
  const { drawerClose, drawerCollapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [campaignPopoverAnchor, setCampaignPopoverAnchor] = useState(null);
  const history = useHistory();

  const isTrialExpired = () => {
    // Se a empresa tem uma data de vencimento definida, não está mais em período de trial
    if (user?.company?.dueDate) return false;
    
    // Se não tem trialExpiration, não está em trial
    if (!user?.company?.trialExpiration) return false;
    
    const trialExpiration = moment(user.company.trialExpiration);
    const now = moment();
    
    return now.isAfter(trialExpiration);
  };

  
  useEffect(() => {
    // Verificar se o plano do usuário tem campanhas habilitadas
    if (user && user.company && user.company.plan && user.company.plan.useCampaigns) {
      setShowCampaigns(true);
    } else {
      setShowCampaigns(false);
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleCampaignPopoverClose = () => {
    setCampaignPopoverAnchor(null);
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<DashboardOutlinedIcon />}
            drawerCollapsed={drawerCollapsed}
            disabled={isTrialExpired()}
          />
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<ChatOutlinedIcon />}
        drawerCollapsed={drawerCollapsed}
        disabled={isTrialExpired()}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<OfflineBoltOutlinedIcon />}
        drawerCollapsed={drawerCollapsed}
        disabled={isTrialExpired()}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
        drawerCollapsed={drawerCollapsed}
        disabled={isTrialExpired()}
      />

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOfferOutlinedIcon />}
        drawerCollapsed={drawerCollapsed}
        disabled={isTrialExpired()}
      />

      
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            {!drawerCollapsed && <Divider />}
            {!drawerCollapsed && (
              <ListSubheader inset>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )}
            {showCampaigns && !drawerCollapsed && (
              <>
                <ListItem
                  button
                  onClick={() => !isTrialExpired() && setOpenCampaignSubmenu((prev) => !prev)}
                  style={{
                    opacity: isTrialExpired() ? 0.5 : 1,
                    cursor: isTrialExpired() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ListItemIcon style={{ opacity: isTrialExpired() ? 0.5 : 1 }}>
                    <VolumeUpOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={isTrialExpired() ? `${i18n.t("mainDrawer.listItems.campaigns")} (Bloqueado)` : i18n.t("mainDrawer.listItems.campaigns")}
                    style={{ opacity: isTrialExpired() ? 0.5 : 1 }}
                  />
                  {!isTrialExpired() && (openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  ))}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu && !isTrialExpired()}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem 
                      onClick={() => !isTrialExpired() && history.push("/campaigns")} 
                      button
                      style={{
                        opacity: isTrialExpired() ? 0.5 : 1,
                        cursor: isTrialExpired() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ListItemIcon style={{ opacity: isTrialExpired() ? 0.5 : 1 }}>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={isTrialExpired() ? "Listagem (Bloqueado)" : "Listagem"}
                        style={{ opacity: isTrialExpired() ? 0.5 : 1 }}
                      />
                    </ListItem>
                    <ListItem
                      onClick={() => !isTrialExpired() && history.push("/contact-lists")}
                      button
                      style={{
                        opacity: isTrialExpired() ? 0.5 : 1,
                        cursor: isTrialExpired() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ListItemIcon style={{ opacity: isTrialExpired() ? 0.5 : 1 }}>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={isTrialExpired() ? "Listas de Contatos (Bloqueado)" : "Listas de Contatos"}
                        style={{ opacity: isTrialExpired() ? 0.5 : 1 }}
                      />
                    </ListItem>
                    <ListItem
                      onClick={() => !isTrialExpired() && history.push("/campaigns-config")}
                      button
                      style={{
                        opacity: isTrialExpired() ? 0.5 : 1,
                        cursor: isTrialExpired() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ListItemIcon style={{ opacity: isTrialExpired() ? 0.5 : 1 }}>
                        <SettingsOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={isTrialExpired() ? "Configurações (Bloqueado)" : "Configurações"}
                        style={{ opacity: isTrialExpired() ? 0.5 : 1 }}
                      />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}
            {showCampaigns && drawerCollapsed && (
              <>
                <ListItem
                  button
                  onClick={(event) => !isTrialExpired() && setCampaignPopoverAnchor(event.currentTarget)}
                  title={isTrialExpired() ? `${i18n.t("mainDrawer.listItems.campaigns")} (Bloqueado)` : i18n.t("mainDrawer.listItems.campaigns")}
                  style={{ 
                    justifyContent: 'center',
                    paddingLeft: 16,
                    paddingRight: 16,
                    opacity: isTrialExpired() ? 0.5 : 1,
                    cursor: isTrialExpired() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ListItemIcon style={{ 
                    minWidth: 'auto',
                    opacity: isTrialExpired() ? 0.5 : 1 
                  }}>
                    <VolumeUpOutlinedIcon />
                  </ListItemIcon>
                </ListItem>
                <Popover
                  open={Boolean(campaignPopoverAnchor) && !isTrialExpired()}
                  anchorEl={campaignPopoverAnchor}
                  onClose={handleCampaignPopoverClose}
                  anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                  }}
                  PaperProps={{
                    style: {
                      marginLeft: 8,
                    }
                  }}
                >
                  <MenuList>
                    <MenuItem onClick={() => {
                      if (!isTrialExpired()) {
                        history.push("/campaigns");
                        handleCampaignPopoverClose();
                      }
                    }}>
                      <ListItemIcon>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </MenuItem>
                    <MenuItem onClick={() => {
                      if (!isTrialExpired()) {
                        history.push("/contact-lists");
                        handleCampaignPopoverClose();
                      }
                    }}>
                      <ListItemIcon>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </MenuItem>
                    <MenuItem onClick={() => {
                      if (!isTrialExpired()) {
                        history.push("/campaigns-config");
                        handleCampaignPopoverClose();
                      }
                    }}>
                      <ListItemIcon>
                        <SettingsOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </MenuItem>
                  </MenuList>
                </Popover>
              </>
            )}
                        <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <SyncAltIcon />
                </Badge>
              }
              drawerCollapsed={drawerCollapsed}
              disabled={isTrialExpired()}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AndroidOutlinedIcon />}
              drawerCollapsed={drawerCollapsed}
              disabled={isTrialExpired()}
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon />}
              drawerCollapsed={drawerCollapsed}
              disabled={isTrialExpired()}
            />
            <ListItemLink
              to="/integrations"
              primary={i18n.t("mainDrawer.listItems.integrations")}
              icon={<PowerOutlinedIcon />}
              drawerCollapsed={drawerCollapsed}
              disabled={isTrialExpired()}
            />
             <ListItemLink
                to="/financeiro"
                primary={i18n.t("mainDrawer.listItems.financeiro")}
                icon={<AccountBalanceOutlinedIcon />}
                drawerCollapsed={drawerCollapsed}
              />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
              drawerCollapsed={drawerCollapsed}
              disabled={isTrialExpired()}
            />
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;