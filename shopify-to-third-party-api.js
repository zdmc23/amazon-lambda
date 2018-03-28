var AWS = require("aws-sdk");
exports.handler = function(event, context, callback) {
	const body = JSON.parse(event['body']);
	const id = JSON.stringify(body.id);
	const ddb = new AWS.DynamoDB();
	ddb.getItem({
		"TableName": "MyTable",
		"Key": {
				"id": { "S": id }
		}
	}, function(err, data) {
		if (err) {
			callback(null,{
				"isBase64Encoded": false,
				"statusCode": 500,
				"headers": { },
				"body": "Error! Unable to get hash from DynamoDB"
			})
		} else {
			// Test (length<3) because length will be 2 due to { } JSON brackets
			if (JSON.stringify(data).trim().length < 3) {
				const api_url = '[redacted]';
				const api_username = '[redacted]';
				const api_password = '[redacted]';
				const https = require('https');
				const postData = JSON.stringify({
					"Email": body.customer.email,
					"Password": "welcome123",
					"FirstName": body.customer.first_name,
					"LastName": body.customer.last_name,
					"UserAccountTypeId": 2
				});
				const options = {
					hostname: api_url,
					port: '443',
					path: '[redacted]',
					method: 'POST',
					version: '1.1',
					headers: {
						'Content-Type': 'application/json',
						'x-username': api_username,
						'x-secret': api_password,
					}
				};
				const req = https.request(options, (res) => {
					var resData = '';
					res.setEncoding('utf8');
					res.on('data', (chunk) => {
						resData += chunk;
					});
					res.on('end', () => {
						const addon_postData = JSON.stringify({
							"Email": body.customer.email, 
							"Quantity": Number(body.line_items[0].quantity)*500
						});
						const addon_options = {
							hostname: api_url,
							port: '443',
							path: '[redacted]',
							method: 'POST',
							version: '1.1',
							headers: {
								'Content-Type': 'application/json',
								'x-username': api_username,
								'x-secret': api_password,
							}
						};
						const addon_req = https.request(addon_options, (addon_res) => {
							var addon_resData = '';
							addon_res.setEncoding('utf8');
							addon_res.on('data', (addon_chunk) => {
								addon_resData += addon_chunk;
							});
							addon_res.on('end', () => {
								ddb.putItem({
									"TableName": "MyTable",
									"Item": {
											"id": { "S": id } 
									}
								}, function (err, data) {
									if (err) {
										callback(null,{
											"isBase64Encoded": false,
											"statusCode": 500,
											"headers": { },
											"body": "Error! Unable to insert hash into DynamoDB"
										})    
									} else {
										callback(null,{
											"isBase64Encoded": false,
											"statusCode": 200,
											"headers": { },
											"body": addon_resData
										})
									}
								});
							});
						});
						addon_req.on('error', (e) => {
							callback(null,{
								"isBase64Encoded": false,
								"statusCode": 500,
								"headers": { },
								"body": "Error! Unable to access API add-on savings dollars method"
							})
						});
						addon_req.write(addon_postData);
						addon_req.end();
					});
				});
				req.on('error', (e) => {
					callback(null,{
						"isBase64Encoded": false,
						"statusCode": 500,
						"headers": { },
						"body": "Error! Unable to access API create account method"
					}) 
				});
				req.write(postData);
				req.end();
			} else {
				callback(null,{
					"isBase64Encoded": false,
					"statusCode": 500,
					"headers": { },
					"body": "Duplicate"
				})
			}
		}
	}) 
}
