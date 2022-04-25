import React from 'react';
import './style.css';

const InputBox = ({ setMessage, sendMessage, message }) => (
  <div className="messageForm">
    <input className="messageFormInput" type="text" placeholder="메세지를 입력해주세요." value={message} onChange={({ target: { value } }) => setMessage(value)} onKeyPress={(event) => (event.key === 'Enter' ? sendMessage(event) : null)} />
    <button className="sendButton" onClick={(e) => sendMessage(e)}>
      SEND
    </button>
  </div>
);

export default InputBox;
