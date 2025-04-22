@description('Name of the Key Vault')
param keyvaultname string 

@description('Location of the Key vault')
param location string = resourceGroup().location

@description('secret value')
param secrets array

@description('IAM Roles')
param systemAssignedIdentity_principalId_array array

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyvaultname
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: '961261db-9c3d-4122-a8b4-2d121cfd97f8'
    
    accessPolicies: []
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
}

resource keyVaultSecrets 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = [for secret in secrets: {
  parent: keyVault
  name: secret.name
  properties: {
    value: secret.value
  }
}]

output keyVaultName string = keyVault.name
output keyvaulturi string = keyVault.properties.vaultUri



@description('The Key Vault Administrator role definition ID')
var keyVaultAdminRoleId = '00482a5a-887f-4fb3-b363-3b7fe8e74483' // Fixed Role ID for Key Vault Administrator



resource roleAssignmentSystemIdentity 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' =[for systemAssignedIdentity_principalId in systemAssignedIdentity_principalId_array: {
    name: guid(keyVault.id, systemAssignedIdentity_principalId, keyVaultAdminRoleId)
    scope: keyVault
    properties: {
      roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultAdminRoleId)
      principalId: systemAssignedIdentity_principalId
    }
  }]

