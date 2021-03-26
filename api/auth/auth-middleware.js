const Auth = require("./auth-model");

const checkUsernameAvailable = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next();
  } else {
    const { username } = req.body;
    const userExists = await Auth.findBy({ username });
    if (userExists.length > 0) {
      res.status(401).json({ message: "username taken" });
    } else {
      next();
    }
  }
};

const checkUsernameExists = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next();
  } else {
    const { username } = req.body;
    const userExists = await Auth.findBy({ username });
    if (!userExists) {
      res.status(401).json({ message: "invalid credentials" });
    } else {
      next();
    }
  }
};

module.exports = {
  checkUsernameAvailable,
  checkUsernameExists,
};
