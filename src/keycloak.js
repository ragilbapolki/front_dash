// src/plugins/keycloak.js
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "company-apps",
  clientId: "dashboard-app",
})

export default keycloak
