const express = require('express');
const { isString, isUndefined, isEmpty, isNumber } = require('lodash');
const { isMongoId } = require('validator');
const { collection } = require('../model/model');
const User = require('../model/model');

const router = express.Router();

router.get('/profile', (req, res, next) => {
  console.log('req.user', req.user)
  res.json({
    message: 'You made it to the secure route',
    user: req.user,
    token: req.query.secret_token
  })
}
);

router.get('/users', async (req, res, next) => {
  try {
    // get all users record

    if (req.user && req.user?.isAdmin == false) {
      return res.status(400).json({ code: 400, err: true, msg: `you are not allowed to access this route` });
    }

    const { _id } = req.user;

    if (!_id || !isMongoId(_id)) {
      const error = new Error('Invalid vendor Id');
      return res.status(400).json({ code: 400, err: true, msg: `Admin Id is not valid!`, meta: error });
    }

    const userInfo = await User.find({}, { password: 0 });
    return res.status(400).json({ code: 200, err: false, userInfo });

  } catch (error) {
    console.log('error', error)
    return res.status(400).json({ code: 400, err: true, msg: `Something went wrong!`, meta: error })
  }
}
);

router.get('/users/:id', async (req, res, next) => {
  try {
    //get one record
    if (req.user && req.user?.isAdmin == false) {
      return res.status(400).json({ code: 400, err: true, msg: `you are not allowed to access this route` });
    }
    const { _id } = req.user;
    const { id } = req.params;

    if (!_id || !isMongoId(_id)) {
      const error = new Error('Invalid vendor Id');
      return res.status(400).json({ code: 400, err: true, msg: `Admin Id is not valid!`, meta: error });
    }

    if (!id || !isMongoId(id)) {
      return res.status(400).json({ code: 400, err: true, msg: `User Id entered is not valid!` });
    }

    const userInfo = await User.findById(id);
    return res.status(200).json({
      code: 200,
      err: false,
      userInfo: {
        _id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        isAdmin: userInfo.isAdmin
      }
    });

  } catch (error) {
    console.log('error', error)
    return res.status(400).json({ code: 400, err: true, msg: `Something went wrong!`, meta: error })
  }
}
);

router.post('/users', async (req, res, next) => {

  if (req.user && req.user?.isAdmin == false) {
    return res.status(400).json({ code: 400, err: true, msg: `you are not allowed to access this route` });
  }

  const {
    name,
    email,
    password,
    isAdmin
  } = req.body

  if (!name || !isString(name) || name.length < 3) {
    const error = new Error('Invalid Name');
    error.name = 'Validation Error';
    return res.status(400).json({ code: 400, error: true, msg: "Enter a valid name" });
  }

  if (
    !isString(password) ||
    password.length < 8 ||
    password.length > 30
  ) {
    const err = new Error('Invalid password. Password should be 8 to 30 characters long');
    err.name = 'ValidationError';
    return res.status(400).json({ code: 400, error: true, msg: "Enter a valid password" });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    if (userExists.email == email) {
      return res.status(400).json({ code: 400, err: true, msg: `user with mail ID ${email} already present` });
    }
  }
  let newUser;
  newUser = await User.create({
    name,
    email,
    password,
    isAdmin
  });

  res.json({
    message: 'new user added successfully',
    userInfo: {
      name,
      email,
      isAdmin
    }
  })
}
);

router.put('/users/:id', async (req, res, next) => {

  if (req.user && req.user?.isAdmin == false) {
    return res.status(400).json({ code: 400, err: true, msg: `you are not allowed to access this route` });
  }

  const { _id } = req.user;
  const { id } = req.params;

  if (!_id || !isMongoId(_id)) {
    const error = new Error('Invalid vendor Id');
    return res.status(400).json({ code: 400, err: true, msg: `Admin Id is not valid!`, meta: error });
  }

  if (!id || !isMongoId(id)) {
    return res.status(400).json({ code: 400, err: true, msg: `User Id entered is not valid!` });
  }

  const {
    name,
    email,
    password,
    isAdmin
  } = req.body


  if (!name || !isString(name) || name.length < 3) {
    const error = new Error('Invalid Name');
    error.name = 'Validation Error';
    return res.status(400).json({ code: 400, error: true, msg: "Enter a valid name" });
  }

  if (
    !isString(password) ||
    password.length < 8 ||
    password.length > 30
  ) {
    const err = new Error('Invalid password. Password should be 8 to 30 characters long');
    err.name = 'ValidationError';
    return res.status(400).json({ code: 400, error: true, msg: "Enter a valid password" });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    if (userExists.email == email) {
      return res.status(400).json({ code: 400, err: true, msg: `user with mail ID ${email} already present` });
    }
  }

  const userInfo = {
    name,
    email,
    password,
    isAdmin
  }

  const updateUser = await User.findByIdAndUpdate(id, userInfo);

  res.json({
    message: 'user updated added successfully',
    userInfo: {
      name,
      email,
      isAdmin
    }
  })
}
);

router.delete('/users/:id', async (req, res, next) => {

  if (req.user && req.user?.isAdmin == false) {
    return res.status(400).json({ code: 400, err: true, msg: `you are not allowed to access this route` });
  }

  const { _id } = req.user;
  const { id } = req.params;

  if (!_id || !isMongoId(_id)) {
    const error = new Error('Invalid vendor Id');
    return res.status(400).json({ code: 400, err: true, msg: `Admin Id is not valid!`, meta: error });
  }

  if (!id || !isMongoId(id)) {
    return res.status(400).json({ code: 400, err: true, msg: `User Id entered is not valid!` });
  }


  const userInfo = await User.findOneAndDelete(id)


  res.json({
    message: 'user removed successfully',
  })
}
);

module.exports = router;