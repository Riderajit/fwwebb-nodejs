@description('Name of the API Management Instance')
param apiManagementName string

@description('Publisher email')
param publisherEmail string

@description('Publisher Name')
param publisherName string

@description('Name of the Function App')
param functionAppName string

@description('Location for resource')
param location string = resourceGroup().location

resource apim 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apiManagementName
  location: location
  sku: {
    name: 'Developer'
    capacity: 1
  }
  properties: {
    publisherEmail: publisherEmail
    publisherName: publisherName

  }
}

resource functionApi 'Microsoft.ApiManagement/service/apis@2022-08-01' = {
  name: '${apiManagementName}/${functionAppName}-api'
  properties: {
    displayName: 'Function App API'
    path: 'functions'
    protocols: [
      'https'
    ]
    format: 'swagger-link-json'
    value: 'https://${functionAppName}.azurewebsites.net/api/swagger.json'
  }
  dependsOn:[
    apim
  ]
}

output apimName string = apim.name
output apiName string = functionApi.name
