# amazon-lambda

A "serverless" implementation of an integration between Shopify and a 3rd party Web Service, a general repository of "serverless" work 

### shopify-to-third-party-api.js

This is code that was used to handle Shopify order requests (with billing/customer info) and then to post a new order via some 3rd party API.  For example, you could advertise and sell via Shopify and then outsource the actual product fulfillment or service to some other party.  You pass along the billing/customer info, and relevant information, etc... This particular implementation had the following workflow:

1. Shopify (via WebHook) -> 
1. Amazon API Gateway (handle web request) -> 
1. Amazon Lambda (serverless processing) -> 
1. Amazon Dynamo (hash request to avoid duplicates) -> 
1. 3rd party API (order placement and fulfillment)

Synchronous response boomerang'd back through the workflow above, and then any Async communication afterwards was from 3rd party to customer via email, SMS, or mailing address
