// import logo from './logo.svg';
import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import "./App.css";
import testImage from "./img/1.png"
import screenImage from "./img/screen.png"

let pitchArray = [];

export default function Game() {
  const canvasRef = useRef(null);
  // image import
  const test = new Image();
  test.src = testImage;

  // const [canvasWidth] = useState(1024);
  const [canvasWidth] = useState(1360);
  // const [canvasHeight] = useState(576);
  // const [onOff, setOnOff] = useState(true)
  const [canvasHeight] = useState(720);
  const [seconds, setSeconds] = useState(0);
  const [frames, setFrames] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(1);
  const [positionX, setPositionX] = useState(-20)
  const [positionY, setPositionY] = useState(600)
  const [clearState, setClearState] = useState(-1000)
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [pitch, setPitch] = useState(0);
  // const [roll, setRoll] = useState(0);
  // const [yaw, setYaw] = useState(0);
  const [onShake, setOnShake] = useState(false);

  class Sprite {
    constructor({ image, x, y , clear}) {
      this.image = image;
      this.x = x;
      this.y = y;
      this.clear = clear;
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      // 
      ctx.drawImage(this.image, this.x, this.y, 3,3);
      ctx.clearRect(this.clear,this.clear, canvasWidth, canvasHeight)
    }
  }

  // useEffect(() => {
  //   const interval = setInterval(() => {}, 800);
  //   return () => clearInterval(interval);
  // }, []);

    // seconds timer

    useEffect(() => {
      setTimeout(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    }, [seconds]);
    
    // set frames counter to set all the states
    useEffect(() => {
      setTimeout(() => {
        setFrames((frames) => frames + 1);
      }, 2);
    });
  
    // set animation frames timer (could rework to a different animation timer) fixed animation timer for now
    useEffect(() => {
      if (frames % 4 === 0) {
        if (animationFrame > 2) {
          setAnimationFrame(0);
        } else if (animationFrame >= 0) {
          setAnimationFrame((animationFrame) => animationFrame + 1);
        }
      }
    }, [frames]);

  function processData(data) {
    let checkData = Number(data);
    if (checkNum(checkData)) {
      // console.log(data);
    } else {
      if (data.indexOf("p") === 0) {
        // console.log(typeof(data))
        let arr = data.split("");
        if (arr[0] === "p") {
          arr.shift();
          let str = arr.join("");
          let num = Number(str);
          // console.log(num)
          // console.log(str)
          // console.log(arr)
          if (!checkNum(num)) {
            // console.log(num);
          } else if (checkNum(num)) {
            pitchAdd(num, pitchArray);
            setPitch(mostFrequent(pitchArray, pitchArray.length));
          }
        } else {
          console.log("Not a valid Pitch");
        }
        // console.log(arr)
        // console.log(data)
      } else if (data.indexOf("s") === 0) {
        setOnShake(true);
        setTimeout(() => {
          // console.log("Delayed for 0.5 second.");
          setOnShake(false);
        }, "200");
      }
    }
  }
  function pitchAdd(num, arr) {
    if (arr.length > 40) {
      arr.pop();
      arr.unshift(num);
    } else {
      arr.unshift(num);
    }
    // console.log(arr)
  }
  function mostFrequent(arr, n) {
    let maxcount = 0;
    let element_having_max_freq;
    for (let i = 0; i < n; i++) {
      let count = 0;
      for (let j = 0; j < n; j++) {
        if (arr[i] === arr[j]) count++;
      }

      if (count > maxcount) {
        maxcount = count;
        element_having_max_freq = arr[i];
      }
    }

    return element_having_max_freq;
  }
  // function average (arr) {
  //   let sum = 0;
  //   for (let i = 0; i<9; i++) {
  //     sum = sum + arr[i]
  //     // console.log(sum)
  //   }
  //   return Math.floor(sum/arr.length);
  // }

  function checkNum(x) {
    if (isNaN(x)) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onData(value) {
      // console.log(typeof(value))
      processData(value);
      // soundTrack(a,b,c)
      // setAge(a => a + 1);
    }
    socket.on("serialData", onData);
    socket.on("connection", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("serialData", onConnect);
      socket.off("connection", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const testing = new Sprite({
    image: test,
    x: positionX,
    y: positionY,
    clear: clearState
  })

  // draw canvas and move character. better to separate in different canvas
  useEffect(() => {
    // screening.draw()
    testing.draw();
    for(let i = 0; i<50;i++){
      setClearState(-1000)
      setPositionX(positionX+1)
      // setPositionY(positionY-1)
      if (positionX>canvasWidth+200){
        setClearState(0)
        setPositionX(0)
      }
    }
    }, [frames]);
    useEffect(() => {
      if (!onShake) {
        if (positionY<600) {
          setPositionY(positionY+1)
        } else {
          setPositionY(600)
        }
      } else if (onShake) {
        for (let i = 0; i<3;i++) {
          setPositionY(positionY-1)
          setPositionX(positionX)
        }
      }

      // setTimeout(() => {
      //   // console.log("Delayed for 0.5 second.");
      //   // setOnShake(false);
      //   setPositionY(positionY-1)
      // }, "10");
      
      }, [frames]);

  return (
    <div className="App">
      <div>
      </div>
      <div className="mother">
        <div className="parent">
          <div className="title">Position: </div>
          <div className="item">
            <div>
              <p>Pitch: </p>
            </div>
            <div className="value">{pitch}</div>
          </div>
        </div>
        <div className="parent">
          <div className="title">Input: </div>

          <div className="item">
            <div>
              <p>Shake: </p>
            </div>
            <div className="value">{onShake ? "on" : "off"}</div>
          </div>
        </div>
      </div>
      <div className="screen">
      <div className="container">
      <div className="brand">Monitor</div>
      <div className="box" style={{ background: `url(${screenImage})`, height: "720px", width: "1360" }}></div>
      <canvas className="overlay"
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          // style={{  border: "1px darkblue solid" }}
        ></canvas>
      </div>
      </div>
    </div>
  );
}
