/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app =
{
    // Application Constructor
    initialize: function()
	{
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function()
	{
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
		document.getElementById('mainmenu').addEventListener('click',this.menu, false);
		//this is a stupid place to put this
		app.createDatabase();
    },

    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function()
	{
        app.receivedEvent('deviceready');
    },

	createDatabase: function()
	{
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);
		db.transaction(function (tx)
		{ 		
			tx.executeSql('CREATE TABLE IF NOT EXISTS recipients (recipient_id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT)');
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS items (item_id UNIQUE, product_name TEXT, product_desc TEXT, imageUrl TEXT)');
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS purchases (rec_id TEXT, ite_id TEXT)');
			
			//Test results
		
			//tx.executeSql('INSERT INTO purchases VALUES (1,5449000000996)');
	
			//tx.executeSql('INSERT INTO purchases VALUES (2,5000118047794)');
		});
	},
	
    // Update DOM on a Received Event
    receivedEvent: function(id)
	{
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

	addRecipient: function()
	{
		var formFirstName = $('#formFirstname').val();
		
		var formLastName = $('#formLastname').val();
		
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);	
					
		db.transaction(function (tx)
		{
			tx.executeSql('INSERT INTO recipients (recipient_id, first_name, last_name) VALUES (?,?,?)', [null, formFirstName, formLastName]);
		});
		
		document.getElementById('formFirstname').value=null;
		
		document.getElementById('formLastname').value=null;
		
		alert("Successfully added recipient!");
	},

    scan: function()
	{
        console.log('scanning');

        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan( function (result) { 
		var barcode = "5449000000996"; //result.text;
		var apikey = "C3BF9F2C53232A92";
		var url = "http://eandata.com/feed/?v=3&keycode=" + apikey + "&mode=json&find=" + barcode;
		
		var request = new XMLHttpRequest();
		request.open('GET', url, false);
		
		request.send();
	
		if (request.readyState==4 && request.status==200)
		{
			var XMLHttpResponse = request.responseText;

			var ParsedJSON = JSON.parse(XMLHttpResponse);
			
			productName = ParsedJSON.product.attributes.product;
			productDesc = ParsedJSON.product.attributes.description;
			productImageUrl = ParsedJSON.product.image;
			
			var barcode2 = barcode;

			var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);				
			db.transaction(function (tx)
			{
				tx.executeSql('INSERT INTO items (item_id, product_name, product_desc, imageUrl) VALUES (?,?,?,?)', [barcode, productName, productDesc, productImageUrl]);
			});
			
			alert("Successfully scanned item!");
			
			var r=confirm("Would you like to add this item to a recipient?");
				if (r==true)
				{
					app.onItemAddConfirm(barcode2);
				}
				
				else
				{
				}
			
		}
		else
		{
			alert("Something went horribly wrong: " + request.readyState + ", " + request.status);
		}
		
		//Code to check if the barcode is a QR Code and if so open the link in the browser plugin
		//Unfortunately I didnt have time to implement
		
			/*alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  */

           /*console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            document.getElementById("info").innerHTML = result.text;
            console.log(result);*/
            
			/*
            if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
            }
            */

        /*}, function (error) { 
            console.log("Scanning failed: ", error); 
        } );*/
	});
    },
	
	menu: function()
	{
		//clear recipient list
		$( '#recipientlist' ).empty();
		
		//load recipients from db
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);	
		
		db.transaction(function (tx)
		{
			tx.executeSql('SELECT * FROM recipients', [], function (tx, results)
			{
				for(var i = 0; i < results.rows.length; i++)
				{					
					//loop over
					var li = '<li class="ui-last-child"><a href="#userItems" id="' + results.rows.item(i).recipient_id + '" onClick="app.onUserButtonClick(this.id)" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + results.rows.item(i).first_name + ' ' + results.rows.item(i).last_name + '</a></li>';
					$('#recipientlist').append(li);
				}
			});
		});
	},
	
	onUserButtonClick: function(recipient_id) 
	{
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);
		
		//wipe userItems page
		
		$('#userItemsList').empty();
		
		//load list of product ID's related to this user ID     from  purchases table          
		
		db.transaction(function (tx) 
		{  
			tx.executeSql('SELECT * FROM purchases WHERE rec_id=?', [recipient_id],
			 
				function (tx, results)
				{
					var q = "";
					var resultStrings = new Array(results.rows.length);
					for (var i = 0; i < results.rows.length; i++)
					{
						q += (q == "" ? "" : ", ") + "?";
						resultStrings[i] = results.rows.item(i).ite_id;
					}

					//load list of product details from items table
					db.transaction(function (tx)
					{
						tx.executeSql('SELECT * FROM items WHERE item_id IN (' + q + ')', resultStrings, 
							function (tx, data) 
							{
								//loop over list of items and add details to the userItems page elements
								//$('someItemInaList').append('<div> <p>some details about product </p> </div>')
								for(var i = 0; i < data.rows.length; i++)
								{												
									//loop over 
									var li2 = '<li class="ui-last-child"><a href="#itemDetails" id="' + data.rows.item(i).item_id + '" onClick="app.onItemButtonClick(id)" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + data.rows.item(i).product_name + '</a></li>';
									
									$('#userItemsList').append(li2);
								}
							},
				
							function (tx, error)
							{
								alert(error.message);
							}
						);
			
					});
				}, 
			
				function (tx, error) {}
			);
		});
	},	
	
	
	onItemButtonClick: function (id)
	{
		$('#itemDetailsContainer').empty();
		
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);
		
		db.transaction(function (tx)
		{
			tx.executeSql('SELECT * FROM items WHERE item_id=?', [id], function (tx, results)
			{															
					var li = '<div><h4>' + results.rows.item(0).product_name + '</h4><img src="' + results.rows.item(0).imageUrl + '" width="auto" height="auto" alt="Product Image"><br><p>' + results.rows.item(0).product_desc + '</p></div>';
					$('#itemDetailsContainer').append(li);
			});
		});
		
	},
	
	onItemAddConfirm: function (barcode2)
	{		
		window.location.href="#addItem";
		
		$('#addItemContainer').empty();
		
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);	
		
		db.transaction(function (tx)
		{
			tx.executeSql('SELECT * FROM recipients', [], function (tx, results)
			{															
					for(var i = 0; i < results.rows.length; i++)
					{	
														
					var li = '<li class="ui-last-child"><a href="#itemDetails" id="' + results.rows.item(i).recipient_id + "," + barcode2 + '" onClick="app.onItemAddConfirm2(id)" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + results.rows.item(i).first_name + ' ' + results.rows.item(i).last_name + '</a></li>';
					$('#addItemContainer').append(li);
					
					}
			}); 
		});
		
	},
	
	onItemAddConfirm2: function (id)
	{
		
		var array = id.split(',');
				
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);
		
		db.transaction(function (tx)
		{
			tx.executeSql('SELECT * FROM recipients', [], function (tx, results)
			{															
				tx.executeSql('INSERT INTO purchases (rec_id, ite_id) VALUES (?,?)', array);
			});
			
			alert("Successfully added item to recipient");
			
			window.location.href="#page";
			
		});
	}
};
