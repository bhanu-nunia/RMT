const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');


mongoose.set('strictQuery', true);
const dbLink = "mongodb+srv://rmt_db:5rWXKZQYfpuBuqvm@cluster0.7uqrf.mongodb.net/rmtDB?retryWrites=true&w=majority";
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbLink);
  console.log('database connected');
}


require('./auth/auth');

const routes = require('./routes/routes');
const secureRoute = require('./routes/secure-routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}))

app.use('/', routes);

// Plug in the JWT strategy as a middleware so only verified users can access this route.
app.use('/', passport.authenticate('jwt', { session: false }), secureRoute);

// Handle errors.
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

app.listen(3000, () => {
  console.log('Server started at port 3000')
});