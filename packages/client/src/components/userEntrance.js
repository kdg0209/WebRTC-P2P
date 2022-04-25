import React, { useState } from 'react';
import shortId from 'shortid';

const userCheck = (history, roomId) => {
  history.push(`/${roomId}`);
};

function userEntrance({ history }) {
  const [roomId, setRoomId] = useState(shortId.generate());

  return (
    <div className="enter-room-container">
      <form>
        <input
          type="text"
          value={roomId}
          placeholder="Room id"
          onChange={(event) => {
            setRoomId(event.target.value);
          }}
        />
        <button
          onClick={() => {
            userCheck(history, roomId);
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default userEntrance;
