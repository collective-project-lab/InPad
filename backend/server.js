require("dotenv").config();
const express = require("express");
const cors = require("cors");
const verifyToken = require("./src/middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

const notes = [
  {
    id: "1",
    userId: "user-123",
    title: "First Note",
    content: "This is the first static note.",
  },
  {
    id: "2",
    userId: "user-123",
    title: "Second Note",
    content: "This is the second static note.",
  },
  {
    id: "3",
    userId: "user-456",
    title: "Shared Note",
    content: "This note belongs to another user.",
  },
];

// public route
app.get("/", (req, res) => {
  res.send("Inkpad API running...");
});

// get all notes
app.get("/api/notes", (req, res) => {
  res.status(200).json(notes);
});

// get specific note
app.get("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((item) => item.id === id);

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(200).json(note);
});

// delete note
app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const index = notes.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  notes.splice(index, 1);
  res.status(200).json({ message: `Note with id ${id} deleted successfully` });
});

// update note
app.put("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const note = notes.find((item) => item.id === id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  note.title = title;
  note.content = content;
  note.userId = req.user?.uid || note.userId;

  res.status(200).json(note);
});

//create new note
app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const note = {
    id: String(Math.floor(Math.random() * 10000) + 1),
    userId: req.user?.uid || 1111,
    title,
    content,
  };

  notes.push(note);
  res.status(201).json(note);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
