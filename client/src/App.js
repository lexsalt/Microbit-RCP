// import logo from './logo.svg';
import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import "./App.css";
import screenImage from "./img/screen.png";

let pitchArray = [];
const colorGreen = "#33ff33";
const defaultPositionY = 650;

export default function Game() {
  const canvasRef = useRef(null);

  // const [canvasWidth] = useState(1024);
  const [canvasWidth] = useState(1360);
  // const [canvasHeight] = useState(576);
  // const [onOff, setOnOff] = useState(true)
  const [canvasHeight] = useState(720);

  const [seconds, setSeconds] = useState(0);
  const [miliSeconds, setMiliSeconds] = useState(0);
  const [time, setTime] = useState({});
  const [miliTime, setMiliTime] = useState({});
  const [lastTime, setLastTime] = useState({
    min0: 0,
    mm: 0,
    sec0: 0,
    ss: 0,
  });
  const [lastColor, setLastColor] = useState("white");
  const [frames, setFrames] = useState(0);
  const [positionX, setPositionX] = useState(-20);
  const [positionY, setPositionY] = useState(650);
  const [clearState, setClearState] = useState(-1000);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [pitch, setPitch] = useState(0);
  const [onShake, setOnShake] = useState(false);
  const [stroke, setStroke] = useState(true);


  // object constructor of a line to draw on canvas
  class Line {
    constructor({ x, y, color, clear }) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.clear = clear;
    }
    draw() {
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(positionX, positionY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      ctx.closePath();
      ctx.clearRect(this.clear, this.clear, canvasWidth, canvasHeight);
    }
  }

  // hooks to access clock for setting seconds and miliseconds
  // set hour and time with seconds to time function
  useEffect(() => {
    setTimeout(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    let clock = secondsToTime(seconds);
    let sec0 = addZero(clock.s);
    let min0 = addZero(clock.m);
    let mm = clock.m;
    let ss = clock.s;
    setTime({ min0, mm, sec0, ss });
  }, [seconds]);

  useEffect(() => {
    setTimeout(() => {
      setMiliSeconds((miliSeconds) => miliSeconds + 1);
    }, 10);
    let clock = secondsToTime(miliSeconds);
    //console.log("m: "+clock.m+" s: "+clock.s)
    let sec0 = addZero(clock.s);
    let min0 = addZero(clock.m);
    let mm = clock.m;
    let ss = clock.s;
    setMiliTime({ min0, mm, sec0, ss });
  }, [miliSeconds]);

  // seconds to time function
  function secondsToTime(secs) {
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    if (secs === 3600) {
      minutes = 60;
    }

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      m: minutes,
      s: seconds,
    };
    return obj;
  }

  // function to add 0 to 0-9 seconds on clock
  function addZero(sec) {
    if (sec < 10) {
      return 0;
    } else {
      return "";
    }
  }

  // set frames counter to set all the states
  // you have to set it as a dependency to the main hook to avoid
  // red flags of: "to many re-renders"
  useEffect(() => {
    setTimeout(() => {
      setFrames((frames) => frames + 1);
    }, 2);
  });

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
        shakeIt();
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

  function checkNum(x) {
    if (isNaN(x)) {
      return false;
    }
    return true;
  }

  // Event listener for connection to socket
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
  // instantiate an object to draw on canvas
  const lining = new Line({
    x: positionX - 2,
    y: positionY - 2,
    color: colorGreen,
    clear: clearState,
  });

  // Main hook: draw canvas and move object.
  useEffect(() => {
    lining.draw();
    setClearState(-1000);
    setPositionX(positionX + 1);
    // Reset condition: When x reaches edge of canvas + 200
    if (positionX > canvasWidth + 200) {
      setClearState(0);
      setPositionX(0);
    }
    // Shake trigger
    if (!onShake) {
      if (positionY < defaultPositionY) {
        setPositionY(positionY + 3);
      } else {
        setPositionY(defaultPositionY);
      }
    } else if (onShake) {
      if (miliSeconds > 10) {
        if (miliSeconds < 60 && miliSeconds > 30) {
          setLastColor("green");
        } else {
          setLastColor("red");
        }
        let clock = secondsToTime(miliSeconds);
        //console.log("m: "+clock.m+" s: "+clock.s)
        let sec0 = addZero(clock.s);
        let min0 = addZero(clock.m);
        let mm = clock.m;
        let ss = clock.s;
        setLastTime({ min0, mm, sec0, ss });
      }
      setMiliSeconds(0);
      if (positionY > 500) {
        for (let i = 0; i < 3; i++) {
          setPositionY(positionY - 2);
          setPositionX(positionX);
        }
      }
    }
  }, [frames]);

  //hook to trigger shake every 0.5 secs if stroke mode is false
  useEffect(() => {
    if (!stroke) {
      setTimeout(() => {
        shakeIt();
      }, 50);
    } else if (stroke) {
      // console.log(`stroke: ${stroke}`);
    }
  }, [frames]);

  // function to trigger shake status
  const shakeIt = () => {
    if (!onShake) {
      setOnShake(true);
      setTimeout(() => {
        // console.log("Delayed for 0.5 second.");
        setOnShake(false);
      }, 50);
    }
  };

  // function to change mode stroke on/off
  const strokeIt = () => {
    if (stroke) {
      setStroke(false);
    } else if (!stroke) {
      setStroke(true);
    }
  };

  return (
    <div className="App">
      <div></div>
      <div className="mother">
        {/* <div className="parent">
          <div className="title">positionX: </div>

          <div className="item" style={{display: "flex", flexDirection: "column", gap:"1"}}>
            <p>{positionX}</p>
            <p>{positionY}</p>
          </div>
        </div> */}
        <div className="parent">
          <div className="title">Elapsed: </div>
          <div className="item">
            {miliSeconds < 60 && miliSeconds > 30 ? (
              <p style={{ color: "green" }}>{miliSeconds}</p>
            ) : (
              <p style={{ color: "red" }}>{miliSeconds}</p>
            )}
          </div>
          <div className="item">
            <p>
              {lastTime.min0 + lastTime.mm + "." + lastTime.sec0 + lastTime.ss}
            </p>
          </div>
          {/* <div className="item">
            <p>{miliTime.min0 + miliTime.mm + "." + miliTime.sec0 + miliTime.ss}</p>
          </div>
          <div className="item">
            <p>{time.min0 + time.mm + ":" + time.sec0 + time.ss}</p>
          </div> */}
        </div>
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
              {/* <div>
              <p>stroke</p>
            </div> */}
              <div>
                <button
                  style={{
                    background: !stroke ? "green" : "red",
                    height: "3vh",
                    width: "100%",
                    paddingTop: "1vh",
                    paddingBottom: "1vh",
                    marginBottom: "1vh",
                    border: "2px black solid",
                    borderRadius: "5px",
                    color: "white",
                    fontSize: "0.9em",
                  }}
                  onClick={strokeIt}
                >
                  Stroke!
                </button>
              </div>
              {/* <div>
              <p>Shake: </p>
            </div> */}
              {/* <div className="value" style={{ height: "3vh", paddingTop: "1vh", paddingBottom: "1vh", marginY: "1vh"}}>{onShake ? "on" : "off"}</div> */}
              <button
                style={{
                  background: "green",
                  height: "3vh",
                  width: "100%",
                  paddingTop: "1vh",
                  paddingBottom: "1vh",
                  marginBottom: "1vh",
                  border: "2px black solid",
                  borderRadius: "5px",
                  color: "white",
                  fontSize: "0.9em",
                }}
                onClick={shakeIt}
              >
                Shake!
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="screen">
        <div className="container">
          <div
            style={{
              width: "100%",
              display: "flex",
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
              paddingY: "20vh",
              marginTop: "20vh",
            }}
          >
            {!stroke ? (
              <p style={{ color: "green", fontSize: "5em" }}>{"0.45" + " s"}</p>
            ) : (
              <p style={{ color: lastColor, fontSize: "5em" }}>
                {lastTime.min0 +
                  lastTime.mm +
                  "." +
                  lastTime.sec0 +
                  lastTime.ss +
                  " s"}
              </p>
            )}
          </div>
          <div className="brand">Monitor</div>
          <div
            className="box"
            style={{
              background: `url(${screenImage})`,
              height: "720px",
              width: "1360",
            }}
          ></div>
          <canvas
            className="overlay"
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
