import React, { useState, useRef } from 'react';
import io from 'socket.io-client';
import Messages from './Messages';
import InputBox from './InputBox';
import Draggable from 'react-draggable';
import './style.css';

const Chatting = ({ messages }) => {
  const socketRef = useRef();
  const [message, setMessage] = useState('');
  // socketRef.current = io.connect("http://localhost:3001");
  socketRef.current = io.connect('https://webrtc.shop:3001');

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socketRef.current.emit('sendMessage', { message });
      setMessage('');
    }
  };

  return (
    <Draggable>
      <div className="outerContainer">
        <div className="container">
          <div className="infoBar">
            <div className="leftInnerContainer">
              <img className="onlineIcon" src="/images/icons/onlineIcon.png" alt="online icon" />
              <h3>Message</h3>
            </div>
          </div>
          <Messages messages={messages} />
          <InputBox message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </div>
      </div>
    </Draggable>
  );
};

export default Chatting;
