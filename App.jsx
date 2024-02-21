import React from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Split from 'react-split';
import { nanoid } from 'nanoid';
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { notesCollection, db } from './firebase';

export default function App() {
  const [notes, setNotes] = React.useState([]);
  //   const [currentNoteId, setCurrentNoteId] = React.useState(notes[0]?.id || ''); used before db, no longer using localstorage so intial wil; be empty
  const [currentNoteId, setCurrentNoteId] = React.useState('');
  const [tempNoteText, setTempNoteText] = React.useState('');

  const currentNote = notes.find((note) => note.id === currentNoteId) || notes[0];
  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);

  React.useEffect(() => {
    // localStorage.setItem('notes', JSON.stringify(notes));

    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      //  ↑ onSnapshot returns a function that we save to use to unsuscribe

      // ↓ sync up our local notes array with the snapshot data.
      // ↓ snapshot.doc it's an array of docs
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(), // body
        id: doc.id // // id isn't part of the data is part of the doc. document has its own id so doc.id, Now I have and id that comes from the database
      }));
      setNotes(notesArr);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  // setting the tempText to use it as a prop on Editor instead of currentNote. This way every time a user write on the Editor, instead of updating the db (too many unnecessary requests), it will update the tempNoteText state, then I'll use tempText on debouncing strategy below
  React.useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

  // Debouncing -> delay the update on firebase by 500ms
  // effect runs every time tempNoteText changes, delays the sending of request to Firebase using setTimeout and then clearTimeout to clean the old value
  // this still runs on every keystroke (every time tempnotext change) but debouncing help us delay the request by .5s
  // Waits .5s when stop writing
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText);
      }
    }, 500);
    return () => clearTimeout(timeoutId); // this function will get called anytime this useEffect it's about to run again
  }, [tempNoteText]);

  async function createNewNote() {
    const dateCreated = Date.now();

    const newNote = {
      body: "# Type your markdown note's title here",
      createdAt: dateCreated,
      updatedAt: dateCreated
    };
    // setNotes((prevNotes)  => [newNote, ...prevNotes]); instead of setting notes manually we're setting the notes on the snapshot. this line was before applying db
    // setCurrentNoteId(newNote.id); before adding db

    // ↓ returns a reference (as a promise) to the document created (addDoc)
    const newNoteRef = await addDoc(notesCollection, newNote); // pass collection you want to which I want to push this document (notesCollection), newNote object created as second parameter. will return a promise so made it async function and await the response
    setCurrentNoteId(newNoteRef.id);
    console.log(newNoteRef);
  }

  async function updateNote(text) {
    // with db now we only concern of pushing the correct update to firestore because the local notesArray (snapshot) will auto update as expected
    const docRef = doc(db, 'notes', currentNoteId);
    await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true });

    // ↓ before db
    // setNotes((oldNotes) => {
    //   const newArray = [];
    //   for (let i = 0; i < oldNotes.length; i++) {
    //     const oldNote = oldNotes[i];
    //     if (oldNote.id === currentNoteId) {
    //       // Put the most recently-modified note at the top
    //       newArray.unshift({ ...oldNote, body: text });
    //     } else {
    //       newArray.push(oldNote);
    //     }
    //   }
    //   return newArray;
    // });
  }

  async function deleteNote(noteId) {
    // noteId comes from sidebar component event handler
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  }

  //   async function deleteNote(noteId) {
  //     // event.stopPropagation(); before db
  //     // setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId)); before db

  //     const docRef = doc(db, 'notes', noteId); // // doc is from firestore, grab only a document similar to when grabbing a collection
  //     await deleteDoc(docRef); // returns a promise (going to db)
  //   }

  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar
            notes={sortedNotes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
          />
          <Editor tempNoteText={tempNoteText} setTempNoteText={setTempNoteText} />
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
