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
    await noteRef.update({
      title,
      content,
    })
    res.status(200).json({ id: noteRef.key, ...req.body });
  } catch (error) {
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




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
