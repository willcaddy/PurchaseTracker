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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
       // document.getElementById('encode').addEventListener('click', this.encode, false);
		//this is a stupid place to put this
		app.createDatabase();
    },

    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

	createDatabase: function() {
		alert("Creating Database...");
		
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);
			db.transaction(function (tx) {  
			
			alert("Creating Tables...");
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS recipients (id UNIQUE, first_name TEXT, last_name TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS items (id UNIQUE, product_name TEXT, product_desc TEXT)');
		});
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

	

    scan: function() {
        console.log('scanning');
		
		
		
		
		
		
        /*var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan( function (result) {*/ 
				var barcode = "5449000000996"; //result.text;
				var apikey = "C3BF9F2C53232A92";
				var url = "http://eandata.com/feed/?v=3&keycode=" + apikey + "&mode=json&find=" + barcode;
			//	var url = "http://eandata.com/feed/?v=3&keycode=" + apikey + "&mode=json&find=" + barcode;
			
			
				alert(url);
				
				var request = new XMLHttpRequest();
				request.open('GET', url, false);
				
				request.send();
			
					alert("Response recieved " + request.readyState + ", " + request.status);
				
  					if (request.readyState==4 && request.status==200)
					{
					 	var XMLHttpResponse = request.responseText;
			
						alert(XMLHttpResponse);	
			
						var ParsedJSON = JSON.parse(XMLHttpResponse);
			
						alert(ParsedJSON.product.attributes.product);			
			
						alert(url);
						
						productName = ParsedJSON.product.attributes.product;
						productDesc = ParsedJSON.product.attributes.description;
		
		var db = openDatabase('maindb', '1.0', 'Database to store recipients and items ', 2 * 1024 * 1024);				
		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO items (id, product_name, product_desc) VALUES (?,?,?)', [barcode, productName, productDesc]);
		});
						
					}
					else {
						alert("Something went horribly wrong: " + request.readyState + ", " + request.status);
					}
			
   
			
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
    },

    encode: function() {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.encode(scanner.Encode.TEXT_TYPE, "http://www.nhl.com", function(success) {
            alert("encode success: " + success);
          }, function(fail) {
            alert("encoding failed: " + fail);
          }
        );

    },
};
