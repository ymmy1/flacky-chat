import React from 'react';
import './styles/App.css';
import './styles/theme_purple.css';
import './styles/theme_green.css';
import './styles/theme_blue.css';

import { RiAddBoxFill } from 'react-icons/ri';
import { FiSend } from 'react-icons/fi';

import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from 'react-responsive';

import { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  useCollection,
  useCollectionData,
} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyAJeSoS9EgryOdZOtQJYB4GbS5vpQsmLGs',
  authDomain: 'flacky-chat.firebaseapp.com',
  projectId: 'flacky-chat',
  storageBucket: 'flacky-chat.appspot.com',
  messagingSenderId: '742841221929',
  appId: '1:742841221929:web:584daff9fd8021c5afed38',
  measurementId: 'G-M4S1554X21',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return <div className='App'>{user ? <ChatRoom /> : <SignIn />}</div>;
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className='signIn-page'>
      <div className='signIn-page_box'>
        <div className='header'>
          <img src='/bubbles/theme_purple.png' alt='logo' />
          <p>
            Flacky<strong>Chat</strong>
          </p>
        </div>
        <div className='body'>
          <p>
            Welcome to{' '}
            <span>
              <span>Flacky</span>
              Chat
            </span>
          </p>
          <button onClick={signInWithGoogle}>
            <img
              className='google-icon'
              src='/bubbles/google-logo-9808.png'
              alt='Google Sign In Button'
            />{' '}
            Sign In with Google
          </button>
        </div>
        <div className='footer'>
          <a
            href='https://github.com/ymmy1/flacky-chat'
            target='_blank'
            rel='noreferrer'
          >
            https://github.com/ymmy1/flacky-chat
          </a>
        </div>
      </div>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function Settings(props) {
  return (
    <>
      <div
        className={`settings ${props.className}`}
        onClick={props.toggleSwitch}
      ></div>
      <div className={`settings-box settings-box-${props.className}`}>
        <div className='header'>
          <img src={`/bubbles/theme_${props.theme}.png`} alt='logo' />
          <p>
            Flacky<strong>Chat</strong>
          </p>
        </div>
        <div className='body'>
          <h1>Select Theme</h1>
          <div className='theme-selection'>
            <div
              id='theme_blue'
              className={`theme ${
                props.theme === 'blue' ? 'themeBorder' : 'defaultBorder'
              }`}
              onClick={() => props.changeTheme('blue')}
            ></div>
            <div
              id='theme_purple'
              className={`theme ${
                props.theme === 'purple' ? 'themeBorder' : 'defaultBorder'
              }`}
              onClick={() => props.changeTheme('purple')}
            ></div>
            <div
              id='theme_green'
              className={`theme ${
                props.theme === 'green' ? 'themeBorder' : 'defaultBorder'
              }`}
              onClick={() => props.changeTheme('green')}
            ></div>
          </div>
          <p>{props.theme}</p>
        </div>
        <div className='footer'>
          <SignOut />
        </div>
      </div>
    </>
  );
}

function ChatRoom() {
  // scroll down on new message
  const dummyScroll = useRef();

  // checking if we need to paste the swiping func
  const isMobile = useMediaQuery({ query: `(max-width: 770px)` });
  console.log('isMobile');
  console.log(isMobile);
  console.log(useMediaQuery);

  // name to display
  let firstName = auth.currentUser.displayName.split(' ')[0];

  // Room State Switch
  const [room, setRoom] = useState('general');
  const [roomType] = useState('public');
  const roomsRef = firestore.collection('public');
  const [rooms] = useCollection(roomsRef);

  const [isBarOpen, setIsBarOpen] = useState(false);

  // get messages from Room Switch
  const messagesRef = firestore.collection(`${roomType}/${room}/messages`);
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });

  // Settings menu toggle
  const [showSettings, setShowSettings] = useState(false);
  // theme change toggle
  const [theme, setTheme] = useState('purple');
  const [formValue, setFormValue] = useState('');

  const [channelValue, setChannelValue] = useState('');

  const handlers = useSwipeable({
    onSwipedLeft: () => setIsBarOpen(false),
    onSwipedRight: () => setIsBarOpen(true),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const changeTheme = (theme) => {
    setTheme(theme);
  };

  const addChannel = async (e) => {
    e.preventDefault();
    if (channelValue.length > 0) {
      await roomsRef.doc(channelValue).set({});
      setChannelValue('');
    }
  };
  useEffect(() => {
    dummyScroll.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    console.log('sending');
    console.log(messagesRef);
    e.preventDefault();
    if (formValue.length > 0) {
      const { uid, displayName, photoURL } = auth.currentUser;

      await messagesRef.add({
        system: false,
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        displayName,
        uid,
        photoURL,
      });

      setFormValue('');
    }
  };

  const enterRoom = async (newRoom) => {
    setIsBarOpen(false);
    setRoom(newRoom);
    const oldRoom = room;
    const { uid, displayName } = auth.currentUser;

    const oldMessagesRef = firestore.collection(`public/${oldRoom}/messages`);
    const newRef = firestore.collection(`public/${newRoom}/messages`);

    await oldMessagesRef.add({
      system: true,
      text: 'left the room',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
    });
    await newRef.add({
      system: true,
      text: 'entered the room',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
    });
  };

  return (
    <div id={`${theme}UI`} className='ChatRoom'>
      {showSettings ? (
        <Settings
          toggleSwitch={() => setShowSettings(!showSettings)}
          className={'active'}
          theme={theme}
          changeTheme={changeTheme}
        />
      ) : (
        <Settings
          toggleSwitch={() => setShowSettings(!showSettings)}
          className={'inactive'}
          theme={theme}
          changeTheme={changeTheme}
        />
      )}
      <nav>
        <div className='brandName'>
          <img src={`/bubbles/theme_${theme}.png`} alt='flackyChat' />
          <span className='logo_name'>
            Flacky<strong>Chat</strong>
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)}>
          {firstName}
        </button>
      </nav>
      <div className='ChatRoom_Main' {...handlers}>
        <div
          className={'channelArea ' + (isBarOpen ? '' : 'channelArea-hidden')}
        >
          <div className='rooms'>
            <div className='publicChannels'>
              <form onSubmit={addChannel}>
                <header>
                  <h3>Public&nbsp;Channels</h3>
                  <button type='submit'>
                    <RiAddBoxFill />
                  </button>
                </header>
                <div className='body'>
                  <label htmlFor='newChannel'>#</label>
                  <input
                    name='newChannel'
                    type='text'
                    placeholder='New Channel'
                    autoComplete='off'
                    value={channelValue}
                    onChange={(e) => setChannelValue(e.target.value)}
                    maxLength='15'
                  />
                </div>
              </form>
              <ul className='list'>
                {rooms &&
                  rooms.docs.map((r) => {
                    if (room === r.id)
                      return (
                        <li
                          key={`${r.id}-active`}
                          className={`channel room-active`}
                        >
                          #{r.id}
                        </li>
                      );
                    return (
                      <li
                        key={r.id}
                        className={`channel`}
                        onClick={() => enterRoom(r.id)}
                      >
                        #{r.id}
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div className='privateMessages'>
              <header>
                <h3>Private&nbsp;Messages</h3>
                <RiAddBoxFill />
              </header>
              <div className='list'>
                <div className='private'>Admin</div>
                <div className='private'>Tester</div>
              </div>
            </div>
          </div>
          <div className='room-console'>
            {messages &&
              messages.map((msg) => <RoomMesage key={msg.id} message={msg} />)}
            <div ref={dummyScroll}></div>
          </div>
        </div>
        <div className={'chatArea ' + (isBarOpen ? 'chatArea-hidden' : '')}>
          <div className='roomIndicator'>{room}</div>
          <div className='messages'>
            {messages &&
              messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
            <div ref={dummyScroll}></div>
          </div>
          <form onSubmit={sendMessage}>
            <img src={auth.currentUser.photoURL} alt='profile' />
            <input
              type='text'
              value={formValue}
              maxLength='250'
              onChange={(e) => setFormValue(e.target.value)}
            />
            <button type='submit'>
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RoomMesage(props) {
  const { displayName, system, text } = props.message;
  return (
    <>
      {system && (
        <div className='adminMessage'>
          {displayName} {text}
        </div>
      )}
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, displayName, photoURL, system } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <>
      {!system && (
        <div className={`message-box ${messageClass}`}>
          <div className='header'>
            <img src={photoURL} alt='avatar' />
            <p className='name'>{displayName}</p>
          </div>
          <p className='text'>{text}</p>
        </div>
      )}
    </>
  );
}
export default App;
