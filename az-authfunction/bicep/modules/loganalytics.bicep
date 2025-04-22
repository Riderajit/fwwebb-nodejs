@description('Name of the Log Analytics Name')
param loganalyticsName string

@description('Location for Resource')
param location string = resourceGroup().location

resource logAnalystics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: loganalyticsName
  location: location
}

output logAnalyticscustomerId string = logAnalystics.properties.customerId
output logAnalyticsprimarySharedKey string = logAnalystics.listKeys().primarySharedKey
output loglogAnalyticsid string = logAnalystics.id
