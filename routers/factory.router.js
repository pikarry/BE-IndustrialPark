const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middlewares/async.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const typeRole = require('../constants/typeRole');

const multer = require('multer');
const upload = multer({ dest: 'uploads' });

const {
  getFactoryOfIndustrial,
  createFactory,
  getFactoryById,
  updateFactory,
  deleteFactory,
  getFactoryByIndustrialIdNotPaging,
  getAll,
} = require('../controllers/factory.controller');

router
  .route('/:id')
  .get(asyncMiddleware(getFactoryById))
  .patch(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    asyncMiddleware(updateFactory),
  )
  .delete(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    asyncMiddleware(deleteFactory),
  );

router
  .route('/industrial/get-all-not-paging')
  .get(asyncMiddleware(getFactoryByIndustrialIdNotPaging));

router.route('/industrial/get-all').get(asyncMiddleware(getAll));

router
  .route('/industrial/:id_indus')
  .get(asyncMiddleware(getFactoryOfIndustrial))
  .post(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.ADMIN),
    upload.single('image'),
    asyncMiddleware(createFactory),
  );

module.exports = router;
