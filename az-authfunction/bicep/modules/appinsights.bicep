@description('Location of the resource')
param location string

@description('Name of the Application Insights resource')
param appInsightsName string

@description('Log Analytics workspace resource ID')
param logAnalyticsid string

resource appInsightsResources 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsid
    Flow_Type: 'Bluefield'
  }
}

// Individual outputs for each Instrumentation Key
output instrumentationKey string = appInsightsResources.properties.InstrumentationKey

