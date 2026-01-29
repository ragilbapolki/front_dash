// src/plugins/keycloak.js
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: "https://ssowim.wim-bms.com",
  realm: "wismilak-portal",
  clientId: "bi.wismilak.com",
  pkceMethod: null,

});

export default keycloak
