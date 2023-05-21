const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middlewares/async.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const typeRole = require('../constants/typeRole');

const multer = require('multer');
const upload = multer({ dest: 'uploads' });

const {
  getAllAccount,
  register,
  login,
  getMyProfile,
  updateProfile,
  updateAvatar,
} = require('../controllers/account.controller');

router
  .route('/')
  .get(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    asyncMiddleware(getAllAccount),
  )
  .post(asyncMiddleware(register))
  .patch(asyncMiddleware(authMiddleware), asyncMiddleware(updateProfile));

router.route('/login').post(asyncMiddleware(login));

router
  .route('/profile')
  .get(asyncMiddleware(authMiddleware), asyncMiddleware(getMyProfile))
  .patch(
    asyncMiddleware(authMiddleware),
    upload.single('avt'),
    asyncMiddleware(updateAvatar),
  );

module.exports = router;
