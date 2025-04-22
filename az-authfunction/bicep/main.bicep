@description('Project Name')
param stack string

@description('Environment')
param env string

@description('Location')
param location string = resourceGroup().location

@description('Storage Account Name')
param storageAccountName string = '${stack}${env}storage'

@description('Name of the Application Insight resource')
param appInsightsName string = '${stack}-${env}appinsights'

@description('Name of the Function App')
param functionAppName string = '${stack}-${env}functionapp'

@description('Name of the Log Analystics')
param logAnalyticsid string = '${stack}-${env}loganalystics'

@description('Name of the API Management instance')
param apiManagementName string = '${stack}-${env}apimv1'

@description('Publisher email for API Management')
param publisherEmail string = '${stack}-${env}@gmail.com'

@description('Publisher name for Name of API Management')
param publisherName string = '${stack}-${env}admin'

@description('Secrets to store in Key Vault')
param secret array

@description('Key vault name')
param key_vault_name string = '${stack}-${env}secret'

// Module : Log Analytics
module loganalytics './modules/loganalytics.bicep' = {
  name: 'loganalyticsDeployment'
  params: {
    loganalyticsName: logAnalyticsid
    location: location
  }
}

// Module: Application Insight
module  appInsightsModule './modules/appinsights.bicep' = {
  name: 'appInsightDeployment'
  params: {
    location: location
    appInsightsName: appInsightsName
    logAnalyticsid: loganalytics.outputs.loglogAnalyticsid
  }
}

// Module: Storage Account
module storageModule './modules/storage.bicep' = {
  name: 'storageDeployment'
  params: {
    location: location
    storageAccountName: storageAccountName
  }
}

// Module: Function App
module functionAppModule './modules/functionapp.bicep' = {
  name: 'functionAppDeployment'
  params: {
    functionAppName: functionAppName
    location: location
    storageaccount_name: storageModule.outputs.storageaccount_name
    storageaccount_listKeys: storageModule.outputs.storageaccount_listKeys
    appInsightsKey: appInsightsModule.outputs.instrumentationKey
  }
}

// //Module: Key Vault
// module keyVaultModule './modules/keyvault.bicep' = {
//   name: 'KeyVaultDeployment'
//   params: {
//     keyvaultname: key_vault_name
//     location: location
//     secrets: secret
//     systemAssignedIdentity_principalId_array: [
//       functionAppModule.outputs.principalId
//     ]
//   }
// }

module apiManagementModule './modules/apim.bicep' = {
  name: 'apiManagementDeployment'
  params: {
    apiManagementName: apiManagementName
    publisherEmail: publisherEmail
    publisherName: publisherName
    functionAppName: functionAppName
    location: location
  }
  dependsOn: [
    functionAppModule
  ]
}

