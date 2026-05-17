require("dotenv").config();
const express = require("express");
const cors = require("cors");
const verifyToken = require("./src/middleware/auth");
const { db } = require("./src/firebase");

const app = express();

app.use(cors());
app.use(express.json());

// public route
app.get("/", (req, res) => {
  res.send("Inkpad API running...");
});

// get all notes
app.get("/api/notes", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection("notes").where("userId", "==", req.user.uid).get();
    const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get specific note
app.get("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("notes").doc(id).get();

    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
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
app.delete("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("notes").doc(id).get();

    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: "Note not found" });
    }

    await db.collection("notes").doc(id).delete();
    res.status(200).json({ message: `Note with id ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update note
app.put("/api/notes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const doc = await db.collection("notes").doc(id).get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: "Note not found" });
    }

    await db.collection("notes").doc(id).update({
      title,
      content,
    });

    const updatedDoc = await db.collection("notes").doc(id).get();
    res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//create new note
app.post("/api/notes", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const docRef = await db.collection("notes").add({
      userId: req.user.uid,
      title,
      content,
      createdAt: new Date(),
    });

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
