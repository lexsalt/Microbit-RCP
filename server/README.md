## microbit-serial-port-nodejs

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Microbit javascript code

serial.onDataReceived(serial.readString(), function () {
    serial.writeLine("received")
})
input.onGesture(Gesture.Shake, function () {
    serial.writeLine("s")
})
serial.redirectToUSB()
basic.forever(function () {
    serial.writeLine("p" + input.rotation(Rotation.Pitch))
    basic.pause(200)
    serial.writeLine("r" + input.rotation(Rotation.Roll))
    basic.pause(200)
})
