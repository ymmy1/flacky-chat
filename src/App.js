import './styles/App.css';

import { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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

function ChatRoom() {
  const dummyScroll = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    dummyScroll.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (formValue.length > 0) {
      const { uid, photoURL } = auth.currentUser;

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });

      setFormValue('');

      dummyScroll.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='ChatRoom'>
      <nav>
        <div className='brandName'>
          <img src='/bubbles/theme_purple.png' alt='flackyChat' />
          <span className='logo_name'>
            Flacky<strong>Chat</strong>
          </span>
        </div>
        <ul className='navbar-nav'>
          <li className='nav-item'>
            <SignOut />
          </li>
          <li className='nav-item'>
            <button
              data-toggle='modal'
              data-target='#nicknameModalCenter'
              id='display_nickname'
              className='btn'
            >
              Register
            </button>
          </li>
        </ul>
      </nav>

      <div className='ChatRoom_main'>
        <div className='channelArea'>
          <div className='publicChannels'>
            <header>
              <h3>Public Channels</h3> <a href='/'>+</a>
            </header>
            <form>
              <label htmlFor='newChannel'>#</label>
              <input name='newChannel' type='text' placeholder='New Channel' />
            </form>
            <div className='list'>
              <div className='channel'>#general</div>
              <div className='channel'>#flackychat</div>
            </div>
          </div>
          <div className='privateMessages'>
            <header>
              <h3>Private Messages</h3> <a href='/'>+</a>
            </header>
            <div className='list'>
              <div className='private'>Admin</div>
              <div className='private'>Tester</div>
            </div>
          </div>
        </div>
        <div className='chatArea'>
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummyScroll}></div>

          <form onSubmit={sendMessage}>
            <input
              type='text'
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />
            <button type='submit'>🐣</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='avatar' />
      <p>{text}</p>
    </div>
  );
}
export default App;
