import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { ProgressBar, Button } from "react-bootstrap";

let socket;

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setnewMessage] = useState("");
  const [yes, setYes] = useState(0);
  const [no, setNo] = useState(0);
  const [maybe, setMaybe] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    socket = socketIOClient(process.env.REACT_APP_HOST);
    return () => {
      socket.disconnected();
    };
  }, []);

  useEffect(() => {
    socket.on("receive", (msg) => {
      setMessages([...messages, msg]);
    });
    return () => socket.off("receive");
  }, [messages]);

  useEffect(() => {
    socket.on("welcome", (msgList) => {
      let m = [...messages].concat(msgList);
      setMessages(m);
    });
    return () => socket.off("welcome");
  }, []);

  useEffect(() => {
    socket.on("poll", (msg) => {
      if (msg == "yes") {
        setYes(yes + 1);
      } else if (msg == "no") {
        setNo(no + 1);
      } else if (msg == "maybe") {
        setMaybe(maybe + 1);
      }
      console.log(total);
      setTotal(total + 1);
    });
    return () => socket.off("poll");
  }, [total, yes, no, maybe]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    socket.emit("send", newMessage);
    setnewMessage("");
  };
  console.log(total);
  return (
    <div>
      <h1>Chat app</h1>
      <p>Type something and hit "Send"</p>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m.body}</li>
        ))}
      </ul>
      <form onSubmit={handleFormSubmit}>
        <input
          value={newMessage}
          onChange={(e) => setnewMessage(e.target.value)}
          type="text"
        />
        <button type="submit">Send</button>
      </form>
      <Button onClick={() => socket.emit("vote", "yes")} variant="success">
        Yes
      </Button>
      <Button onClick={() => socket.emit("vote", "no")} variant="warning">
        No
      </Button>
      <Button onClick={() => socket.emit("vote", "maybe")} variant="danger">
        Maybe
      </Button>
      <ProgressBar>
        <ProgressBar
          striped
          variant="success"
          now={(yes * 100) / total}
          key={1}
        />
        <ProgressBar variant="warning" now={(no * 100) / total} key={2} />
        <ProgressBar
          striped
          variant="danger"
          now={(maybe * 100) / total}
          key={3}
        />
      </ProgressBar>
    </div>
  );
}
