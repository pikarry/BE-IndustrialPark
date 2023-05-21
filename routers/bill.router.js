const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middlewares/async.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const typeRole = require('../constants/typeRole');

const {
  getAllBillOfUser,
  createBill,
  responseBillSuccess,
  responseBillCancel,
} = require('../controllers/bill.controller');

router
  .route('/')
  .post(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.USER),
    asyncMiddleware(createBill),
  );

router
  .route('/contract/:id')
  .get(
    asyncMiddleware(authMiddleware),
    roleMiddleware([typeRole.ADMIN, typeRole.USER]),
    asyncMiddleware(getAllBillOfUser),
  );

router.route('/payment/success').get(asyncMiddleware(responseBillSuccess));
router.route('/payment/cancel').get(asyncMiddleware(responseBillCancel));
module.exports = router;
