const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse URL-encoded bodies (form data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database', 'database.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the contacts table if it doesn't exist with the new fields
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dob TEXT,
        gender TEXT,
        religion TEXT,
        nationality TEXT,
        marital_status TEXT,
        languages TEXT,
        qualification TEXT,
        experience TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Route to display the input form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { name, dob, gender, religion, nationality, marital_status, languages, qualification, experience } = req.body;

  db.run(`
    INSERT INTO contacts (name, dob, gender, religion, nationality, marital_status, languages, qualification, experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, dob, gender, religion, nationality, marital_status, languages, qualification, experience], function(err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      res.status(500).send('Error submitting the form.');
    } else {
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      res.redirect('/contacts'); // Redirect to the contacts list page
    }
  });
});

// Route to display all contacts in a table
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching contacts:', err.message);
      res.status(500).send('Error fetching contact data.');
    } else {
      res.render('contacts', { contacts: rows });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});