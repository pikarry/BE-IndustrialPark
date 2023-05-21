const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middlewares/async.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const typeRole = require('../constants/typeRole');

const multer = require('multer');
const upload = multer({ dest: 'uploads' });

const {
  getAllIndustrial,
  createIndustrial,
  updateIndustrial,
  deleteIndustrial,
  findIndustrialById,
  getAllNotPaging,
} = require('../controllers/industrial.controller');

router
  .route('/')
  .get(asyncMiddleware(getAllIndustrial))
  .post(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    upload.single('image'),
    asyncMiddleware(createIndustrial),
  );

router.route('/get-all-not-paging').get(asyncMiddleware(getAllNotPaging));

router
  .route('/:id')
  .get(asyncMiddleware(findIndustrialById))
  .patch(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    upload.single('image'),
    asyncMiddleware(updateIndustrial),
  )
  .delete(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    asyncMiddleware(deleteIndustrial),
  );

module.exports = router;
