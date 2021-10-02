import './App.css';

import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { signOut } from '@firebase/auth';

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
const firestone = firebase.firestore();

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

    <button onClick={() => auth.signOut()}>SIgn Out</button>
  )
}

function ChatRoom() {
  return (
    <div>
      <h1>ChatRoom</h1>
      <SignOut />
    </div>
  )
}
export default App;
