const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const { stringify } = require('querystring');
const app = express();

mongoose.connect('mongodb+srv://adithya:adi712thya@cluster0.dzpvowv.mongodb.net/Cluster0?retryWrites=true&w=majority')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
  });
  
  const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




app.get('/register', (req, res) => {
  res.render('register');
});

  

app.post('/register', async (req, res) => {
    try {

      const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
      
      if (existingUser) {

        const errorMessage = 'Username or email already exists';
        res.render('register', { errorMessage });
      } else {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword
        });
        await newUser.save();
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });

  app.get('/', (req, res) => {
    res.render('login', { errorMessage: '' });
  });
  
  app.post('/login', async (req, res) => {
    try {
    
      const { username, password } = req.body;
      const user = await User.findOne({ username });
  
      if (!user || !bcrypt.compareSync(password, user.password)) {
        const errorMessage = 'Invalid username or password';
        res.render('login', { errorMessage });
      } else {
        res.redirect('/dashboard');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });
  app.get('/dashboard', (req, res) => {
    res.render('dashboard');
  });
  
  

app.listen(80, () => console.log('Server is running on http://localhost:80'));
