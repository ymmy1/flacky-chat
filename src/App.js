import './App.css';

import { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyAJeSoS9EgryOdZOtQJYB4GbS5vpQsmLGs",
  authDomain: "flacky-chat.firebaseapp.com",
  projectId: "flacky-chat",
  storageBucket: "flacky-chat.appspot.com",
  messagingSenderId: "742841221929",
  appId: "1:742841221929:web:584daff9fd8021c5afed38",
  measurementId: "G-M4S1554X21"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header className="App-header">
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (

    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummyScroll = useRef()
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('')

  useEffect(() => {
    dummyScroll.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages]);
  const sendMessage = async (e) => {

    e.preventDefault();
    if (formValue.length > 0) {
      const { uid, photoURL } = auth.currentUser

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })

      setFormValue('')

      dummyScroll.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <SignOut />
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummyScroll}></div>
      </main>

      <form onSubmit={sendMessage}>

        <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">🐣</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="avatar" />
      <p>{text}</p>
    </div>
  )
}
export default App;
