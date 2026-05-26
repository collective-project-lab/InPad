// require("dotenv").config();
import { admin } from "./src/firebase/admin.js";
import express from "express";
import cors from "cors";
import verifyToken from "./src/middleware/auth.js";
// const { db } = require("./src/firebase/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/notes", verifyToken);
app.use("/api/auth", verifyToken);

// get database
const db = admin.database();

// public route
app.get("/", (req, res) => {
  res.send("Inkpad API running...");
});

//create new note
app.post("/api/notes",  async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    //get reference of node
    const ref = db.ref(`users/${req.user.uid}/notes`)
    const noteRef = ref.push()
    await noteRef.set({
      title,
      content,
      createdAt: new Date(),
    })

    //return response
    res.status(201).json({ id: noteRef.key, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update note
app.put("/api/notes/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const userId = req.user.uid
    //get reference of note
    const noteRef = db.ref(`users/${userId}/notes/${id}`);
    
    // First check if note exists
    const snapshot = await noteRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Update the note
    await noteRef.update({
      title,
      content,
    })
    
    // Return the updated note data
    res.status(200).json({ 
      id, 
      title,
      content,
      createdAt: snapshot.val().createdAt
    });
  } catch (error) {
    console.error('Update error:', error)
    res.status(500).json({ error: error.message });
  }
});

// get all notes
app.get("/api/notes",  async (req, res) => {
  try {
    //get reference of node
    const notesRef = db.ref(`users/${req.user.uid}/notes`);
    //listen to once event to get data
    const snapshot = await notesRef.once("value");
    const notes = [];
    snapshot.forEach((childSnapshot) => {
      notes.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get specific note
app.get("/api/notes/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid
    //get reference of note
    const noteRef = db.ref(`users/${userId}/notes/${id}`);
    const snapshot = await noteRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json({ id: snapshot.key, ...snapshot.val() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/notes", async (req, res) => {
  const snapshot = await db.collection("notes").get()
  const notes = snapshot.docs.map((doc) => ({ id: doc.id, userId: doc.data().userId }))
  res.json(notes)
})

// delete note
app.delete("/api/notes/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid
    //get reference of note
    const noteRef = db.ref(`users/${userId}/notes/${id}`);
    await noteRef.remove();
    res.status(200).json({ message: `Note with id ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// migrate notes from guest account to named account
app.post("/api/auth/migrate-notes", async (req, res) => {
  try {
    const { guestUid, namedUid } = req.body;
    const requestingUid = req.user.uid;

    // Verify the requesting user is the named user (the one just created)
    if (requestingUid !== namedUid) {
      return res.status(403).json({ error: "Unauthorized: Cannot migrate notes for another user" });
    }

    if (!guestUid || !namedUid) {
      return res.status(400).json({ error: "guestUid and namedUid are required" });
    }

    // Get all notes from guest account
    const guestNotesRef = db.ref(`users/${guestUid}/notes`);
    const guestSnapshot = await guestNotesRef.once("value");

    let migratedCount = 0;

    if (guestSnapshot.exists()) {
      // Get reference to named user's notes
      const namedNotesRef = db.ref(`users/${namedUid}/notes`);

      // Copy each guest note to named account
      guestSnapshot.forEach((childSnapshot) => {
        const noteId = childSnapshot.key;
        const noteData = childSnapshot.val();
        
        // Copy note to named account
        namedNotesRef.child(noteId).set(noteData);
        migratedCount++;
      });

      // Delete guest notes after successful migration
      await guestNotesRef.remove();
    }

    res.status(200).json({ 
      message: "Notes migrated successfully",
      migratedCount 
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ error: error.message });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
