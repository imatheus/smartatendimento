import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import ThemedToastContainer from "../components/ThemedToastContainer/index.jsx";

import LoggedInLayout from "../layout/index.jsx";
import Dashboard from "../pages/Dashboard/index.jsx";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer/index.jsx";
import Signup from "../pages/Signup/index.jsx";
import Login from "../pages/Login/index.jsx";
import Connections from "../pages/Connections/index.jsx";
import SettingsCustom from "../pages/SettingsCustom/index.jsx";
import Financeiro from "../pages/Financeiro/index.jsx";
import Users from "../pages/Users/index.jsx";
import Contacts from "../pages/Contacts/index.jsx";
import Queues from "../pages/Queues/index.jsx";
import Tags from "../pages/Tags/index.jsx";
import Integrations from "../pages/Integrations/index.jsx";
import ContactLists from "../pages/ContactLists/index.jsx";
import ContactListItems from "../pages/ContactListItems/index.jsx";
// import Companies from "../pages/Companies/index.jsx";
import QuickMessages from "../pages/QuickMessages/index.jsx";
import { AuthProvider, AuthContext } from "../context/Auth/AuthContext.jsx";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext.jsx";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext.jsx";
import TrialGuard from "../components/TrialGuard/index.jsx";
import Route from "./Route.jsx";
import Campaigns from "../pages/Campaigns/index.jsx";
import CampaignsConfig from "../pages/CampaignsConfig/index.jsx";
import CampaignReport from "../pages/CampaignReport/index.jsx";
import Subscription from "../pages/Subscription/index.jsx";

const RoutesContent = () => {
  const { user } = useContext(AuthContext);
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    // Verificar se o plano do usuário tem campanhas habilitadas
    if (user && user.company && user.company.plan && user.company.plan.useCampaigns) {
      setShowCampaigns(true);
    } else {
      setShowCampaigns(false);
    }
  }, [user]);

  return (
    <TicketsContextProvider>
      <TrialGuard>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          {/* <Route exact path="/create-company" component={Companies} /> */}
          <WhatsAppsProvider>
            <LoggedInLayout>
              <Route exact path="/" component={Dashboard} isPrivate />
              <Route
                exact
                path="/tickets/:ticketId?"
                component={TicketResponsiveContainer}
                isPrivate
              />
              <Route
                exact
                path="/connections"
                component={Connections}
                isPrivate
              />
              <Route
                exact
                path="/quick-messages"
                component={QuickMessages}
                isPrivate
              />
              <Route exact path="/tags" component={Tags} isPrivate />
              <Route exact path="/contacts" component={Contacts} isPrivate />
              <Route exact path="/users" component={Users} isPrivate />
              <Route
                exact
                path="/integrations"
                component={Integrations}
                isPrivate
              />
              <Route
                exact
                path="/settings"
                component={SettingsCustom}
                isPrivate
              />
              <Route
                exact
                path="/financeiro"
                component={Financeiro}
                isPrivate
              />
              <Route exact path="/queues" component={Queues} isPrivate />
              <Route
                exact
                path="/subscription"
                component={Subscription}
                isPrivate
              />
              {showCampaigns && (
                <>
                  <Route
                    exact
                    path="/contact-lists"
                    component={ContactLists}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/contact-lists/:contactListId/contacts"
                    component={ContactListItems}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/campaigns"
                    component={Campaigns}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/campaign/:campaignId/report"
                    component={CampaignReport}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/campaigns-config"
                    component={CampaignsConfig}
                    isPrivate
                  />
                </>
              )}
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
      </TrialGuard>
      <ThemedToastContainer />
    </TicketsContextProvider>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoutesContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;