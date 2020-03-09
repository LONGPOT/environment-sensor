//const mcpadc = require('mcp-spi-adc');  // include the MCP SPI library
//const sampleRate = { speedHz: 20000 };  // ADC sample rate
// let device = {};          // object for device characteristics
let buttonValue = null;
//let supplyVoltage = 3.3;  // analog reference voltage
//let resolution = 1.0;     // A-to-D resolution
let readingInterval;      // interval to do readings (initialized at bottom)



let Gpio = require('onoff').Gpio; // include onoff library

// set I/O pin as input, listening for both rising and falling changes:
let button = new Gpio(18, 'in', 'both');
// set LED as output:
let led = new Gpio(17, 'out');
// the state of the LED:
let ledState = 0;



// start the event listener:
button.watch(readButton);



const https = require('https');
// change the hostname, macAddress, and sessionKey to your own:
let hostName = 'tigoe.io';
let macAddress = 'b8:27:eb:d3:ef:0f';
let sessionKey = '5EEDF277-F118-4BC9-A1BA-EADC09EB790D';

/*
	the callback function to be run when the server response comes in.
	this callback assumes a chunked response, with several 'data'
	events and one final 'end' response.
*/
function getServerResponse(response) {
   // when the final chunk comes in, print it out:
   response.on('end', function (data) {
      console.log(data);
   });
}


// event listener function for button:
function readButton(error, value) {
    if (error) throw error;
    // print the button value:
    buttonValue = value;
    console.log(value);
    // if the button is pressed:
    if (value === '1') {
        // toggle the ledState:
        if (ledState === 1) {
            ledState = 0;
        } else {
            ledState = 1;
        }
        // set the LED with ledState:
        led.writeSync(ledState);
    }
}   


// callback function for tempSensor.read():
// function getTemperature(error, reading) {
//    if (error) throw error;
//    // range is 0-1. Convert to Celsius (see TMP36 data sheet for details)
//    let temperature = (reading.value * supplyVoltage - 0.5) * 100;
//    // convert to a floating point number of 2 decimal point precision:
//    device.temperature = Number(temperature.toFixed(2));
// }


// get sensor readings into the object called device:
function getReadings() {
   // get readings:
   //tempSensor.read(getTemperature);
   // if they're both numbers:
   if (!isNaN(buttonValue)) {
      // print them and send to server:
      //console.log(device);
      sendToServer(buttonValue);
      // stop reading:
      clearInterval(readingInterval);
   }
}

// assemble the HTTPS request and send it:
function sendToServer(dataToSend) {
   // make the POST data a JSON object and stringify it:
   var postData = JSON.stringify({
      'macAddress': macAddress,
      'sessionKey': sessionKey,
      'data': dataToSend
   });

   /*
    set up the options for the request.
    the full URL in this case is:
    http://example.com:443/data
   */
   var options = {
      host: hostName,
      port: 443,
      path: '/data',
      method: 'POST',
      headers: {
         'User-Agent': 'nodejs',
         'Content-Type': 'application/json',
         'Content-Length': postData.length
      }
   };

   var request = https.request(options, getServerResponse);	// start it
   request.write(postData);			// send the data
   request.end();			            // end it

}

// set an interval to keep running. The callback function (getReadings)
// will clear the interval when it gets good readings:
readingInterval = setInterval(getReadings, 1000);