import React, { useEffect, useState, useRef } from 'react';
import './style.css';
import io from 'socket.io-client';
import Chatting from '../Chat/index.js';

function video(props) {
  const { roomId } = props.match.params;
  const [micState, setMicState] = useState(true);
  const [camState, setCamState] = useState(true);
  const [chatState, setChatState] = useState(true);
  const [isVideoShare, setIsVideoShare] = useState(false);
  const [isSharedByRemote, setIsSharedByRemote] = useState(false);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();
  const peerRef = useRef();
  const localVideoRef = useRef(null);
  const shareVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };

  // style state
  const localHoverInit = {
    opacity: 0,
    zIndex: 9,
  };
  const videoFull = {
    width: '250px',
    height: '190px',
    opacity: 1,
  };
  const videoMinimize = {
    width: '50px',
    height: '50px',
    opacity: 0,
  };
  const [localHover, setLocalHover] = useState(localHoverInit);
  const [localAct, setLocalAct] = useState(videoFull);

  const setVideoTracks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (!(peerRef.current && socketRef.current)) {
        console.log('연결된 Peer 또는 Socket이 없습니다.');
      }

      stream.getTracks().forEach((track) => {
        if (!peerRef.current) return;
        peerRef.current.addTrack(track, stream);
      });

      peerRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) return;
          socketRef.current.emit('createCandidate', { candidate: e.candidate, roomId: roomId });
        }
      };

      peerRef.current.ontrack = (ev) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = ev.streams[0];
          shareVideoRef.current = ev.streams[0];
        }
      };
      socketRef.current.emit('joinRoom', {
        roomId: roomId,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    if (!(peerRef.current && socketRef.current)) {
      console.log('연결된 Peer 또는 Socket이 없습니다.');
    }
    try {
      const sdp = await peerRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerRef.current.setLocalDescription(new RTCSessionDescription(sdp));
      socketRef.current.emit('createOffer', { sdp: sdp, roomId: roomId });
    } catch (e) {
      console.error(e);
    }
  };

  const createAnswer = async (sdp) => {
    if (!(peerRef.current && socketRef.current)) {
      console.log('연결된 Peer 또는 Socket이 없습니다.');
    }
    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const mySdp = await peerRef.current.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });

      await peerRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socketRef.current.emit('createAnswer', { sdp: mySdp, roomId: roomId });
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * 화면 공유 이벤트
   */
  const screenShareHandler = async () => {
    if (isSharedByRemote) {
      alert('상대방이 이미 화면을 공유중입니다. \n상대방의 화면 공유를 중지하고 다시 시도해주세요.');
      return;
    }
    navigator.mediaDevices
      .getDisplayMedia()
      .then((stream) => {
        if (isVideoShare && stream) {
          shareVideoRef.current.srcObject.getTracks().forEach((track) => {
            track.stop();
          });
        }

        const shareScreenTrack = stream.getVideoTracks()[0];
        peerRef.current.addTrack(shareScreenTrack, stream);
        createOffer();

        setIsVideoShare(true);
        shareVideoRef.current.srcObject = stream;

        shareScreenTrack.addEventListener('ended', () => {
          setIsVideoShare(false);
          shareVideoRef.current = null;
          socketRef.current.emit('screenSharing', { isSharedByRemote: false, isVideoShare: false, roomId: roomId });
        });

        if (shareVideoRef.current) {
          socketRef.current.emit('screenSharing', {
            isSharedByRemote: true,
            isVideoShare: true,
            roomId: roomId,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * 화면 비디오 이벤트
   */
  const webCamHandler = () => {
    if (localVideoRef.current.srcObject === undefined || localVideoRef.current.srcObject === null) {
      alert('접근 권한이 없습니다.');
      return;
    } else if (localVideoRef.current.srcObject.getVideoTracks().length > 0) {
      localVideoRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setCamState(!camState);
  };

  /**
   * 화면 오디오 이벤트
   */
  const audioHandler = () => {
    if (localVideoRef.current.srcObject === undefined || localVideoRef.current.srcObject === null) {
      alert('접근 권한이 없습니다.');
      return;
    } else if (localVideoRef.current.srcObject.getAudioTracks().length > 0) {
      localVideoRef.current.srcObject.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setMicState(!micState);
  };
  /**
   * 채팅 버튼 이벤트
   */
  const chatHandler = () => {
    setChatState(!chatState);
  };

  /**
   * 화면 최소화 이벤트
   */
  const videoMinimizeControl = (e) => {
    setLocalAct(e ? videoMinimize : videoFull);
    setLocalHover(localHoverInit);
  };

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    peerRef.current = new RTCPeerConnection(pcConfig);

    socketRef.current.on('userConnection', (ConnectionCount) => {
      if (ConnectionCount > 0) {
        createOffer();
      }
    });

    // 상대방에게 offer 전달
    socketRef.current.on('getOffer', (sdp) => {
      createAnswer(sdp);
    });

    // offer를 전달받은 상대방이 그에 대한 답으로 Answer 전달
    socketRef.current.on('getAnswer', (sdp) => {
      if (!peerRef.current) return;
      peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on('getCandidate', async (candidate) => {
      if (!peerRef.current) return;
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRef.current.on('fullRoom', (roomID) => {
      if (!peerRef.current) return;
      console.log(roomID + ' 해당 Room은 만석입니다.');
    });

    socketRef.current.on('screenShare', ({ SharedByRemoteStatus, shareVideoStatus }) => {
      if (!peerRef.current) return;
      setIsVideoShare(shareVideoStatus);
      setIsSharedByRemote(SharedByRemoteStatus);

      peerRef.current.ontrack = (ev) => {
        shareVideoRef.current.srcObject = ev.streams[0];
      };

      if (!shareVideoStatus) {
        shareVideoRef.current = null;
      }
    });

    socketRef.current.on('userDisconnect', () => {
      remoteVideoRef.current.srcObject = null;
      console.log('user is disconnect');
    });

    socketRef.current.on('getMessages', (result) => {
      setMessages(result);
    });

    setVideoTracks();
  }, []);

  return (
    <div className="video-wrapper">
      <div className="logoBox">
        <img src="/favicon.ico" />
      </div>
      <div className="local-video-wrapper">
        <div
          className="localVideoHoverBox"
          style={localHover}
          onMouseLeave={() => {
            setLocalHover(localHoverInit);
          }}
        >
          <div
            className="localVideoControl"
            onClick={() => videoMinimizeControl(true)}
            style={{
              display: localAct.opacity === 0 ? 'none' : '',
            }}
          >
            <img className="minimizeIcon" src="/images/icons/minimize.png" width={28} />
          </div>
        </div>
        <img
          className="fullscreenIcon"
          src="/images/icons/fullscreen.png"
          onClick={() => videoMinimizeControl(false)}
          style={{
            display: localAct.opacity === 0 ? '' : 'none',
          }}
        />
        <video
          muted
          id="localVideo"
          ref={localVideoRef}
          autoPlay
          style={localAct}
          onMouseOver={() => {
            if (localAct.opacity === 0) return;
            setLocalHover({
              opacity: 1,
              zIndex: 9999,
            });
          }}
        />
      </div>
      <div className="local-video-wrapper">
        <video className={isVideoShare ? 'remoteVideoSmall' : 'remoteVideo'} ref={remoteVideoRef} autoPlay />
      </div>
      {isVideoShare && (
        <div className="local-video-wrapper">
          <video className="shareVideo" ref={shareVideoRef} autoPlay />
        </div>
      )}
      <div className="controls">
        <img
          className="control-btn"
          src="/images/icons/monitor.png"
          onClick={() => {
            screenShareHandler();
          }}
        />
        <img
          className="control-btn"
          src={`/images/icons/mic${micState ? '' : 'Off'}.png`}
          onClick={() => {
            audioHandler();
          }}
        />
        <img
          className="control-btn"
          src={`/images/icons/camera${camState ? '' : 'Off'}.png`}
          onClick={() => {
            webCamHandler();
          }}
        />
        <img
          className="control-btn"
          src={`/images/icons/message${chatState ? '' : 'Off'}.png`}
          onClick={() => {
            chatHandler();
          }}
        />
      </div>
      {!chatState && <Chatting messages={messages} />}
    </div>
  );
}

export default video;
