let express = require('express')
let cors = require('cors')
let app = express()
let server = require('http').Server(app)
let io = require('socket.io')(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
})
let porto = 8888;
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

//Server start
server.listen(porto, () => console.log('on port: ' + porto))

// //user server
app.use(express.static(__dirname + '/public'));

io.on('connection', onConnection);

let connectedSocket = null;
function onConnection(socket){
  console.log("onConnection")
    connectedSocket = socket;
}

// MACBOOK PORT FOR MICROBIT
// to check for the port number in mac:
// open a Terminal window, type ls /dev/tty.usb*, and press enter.
let port = new SerialPort('/dev/tty.usbmodem14202', {
// WINDOWS PORT FOR MICROBIT
// to check the COMXX number look at device manager
// let port = new SerialPort('COM8', {
// let port = new SerialPort('/dev/tty.usbmodem14202', {
    baudRate: 115200,
    autoOpen: false
   })
   

// The Serial port parser
const parser = new Readline();
port.pipe(parser);

// Read the data from the serial port
// parser.on("data", (line) => console.log(`Line: ${line}`));
port.open(() => {
    console.log("Port open");
    parser.on('data', (data) => {
      // console.log('Received Data: ' + data.toString());
      console.log(data);
      io.emit('serialData', data.toString());

    //   processData(data);
    
    });
   })
// parser.on('data', function (data) {
//     console.log('Received Data: ' + data.toString());
//     io.emit('serialdata', { data: data });
// });
//    function processData(data) {
//    }

// Write the data to the serial port
// port.write("ON");
