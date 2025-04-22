@description('Storage Account Name')
param storageAccountName string 

@description('Storage Account Location')
param location string = resourceGroup().location
  
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku:{
    name: 'Standard_LRS'
  }
  properties:{
    accessTier: 'Hot'
  }
}

output storageAccountpropertiesprimaryEndpointsblob string = storageAccount.properties.primaryEndpoints.blob
output storageaccount_name string = storageAccount.name
output storageaccount_listKeys string = storageAccount.listKeys().keys[0].value
