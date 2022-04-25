import getConnection from "../config/database.js";

export const createRoom = (randomID) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO Chatting_Room (user_idx, mentor_idx, room_id, write_at) VALUES (?, ?, ?, now())";
    const params = [1, 2, randomID];
    getConnection((conn) => {
      conn.query(sql, params, (err, result) => {
        conn.release();

        if (!err) {
          resolve();
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  });
};

export const messageSave = (message) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO Chatting (chatting_room_idx, chatting_to_idx, chatting_from_idx, message, is_read, write_at, write_ip) VALUES (?, ?, ?, ?, ?, now(), ?)";
    const params = [1, 2, 1, message, "S", "123.10.485.14"];
    getConnection((conn) => {
      conn.query(sql, params, (err, result) => {
        if (!err) {
          const sql = "SELECT message FROM Chatting WHERE chatting_room_idx = ? ORDER BY write_at ASC";
          const params = [1];
          conn.query(sql, params, (err, result) => {
            conn.release();
            resolve(result);
          });
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  });
};
