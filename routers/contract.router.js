const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middlewares/async.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const typeRole = require('../constants/typeRole');

const {
  getAllContract,
  createContract,
  updateContract,
  deleteContract,
  getContractById,
  // getMyContracts,
} = require('../controllers/contract.controller');

router
  .route('/')
  .get(
    asyncMiddleware(authMiddleware),
    roleMiddleware([typeRole.ADMIN, typeRole.USER]),
    asyncMiddleware(getAllContract),
  )
  .post(
    asyncMiddleware(authMiddleware),
    roleMiddleware(typeRole.USER),
    asyncMiddleware(createContract),
  );

// router
//   .route('/me')
//   .get(
//     asyncMiddleware(authMiddleware),
//     roleMiddleware(typeRole.USER),
//     asyncMiddleware(getMyContracts),
//   );

router
  .route('/:id')
  .get(
    asyncMiddleware(authMiddleware),
    roleMiddleware([typeRole.ADMIN, typeRole.USER]),
    asyncMiddleware(getContractById),
  )
  .patch(
    asyncMiddleware(authMiddleware),
    roleMiddleware([typeRole.ADMIN]),
    asyncMiddleware(updateContract),
  )
  .delete(
    asyncMiddleware(authMiddleware),
    roleMiddleware([typeRole.ADMIN]),
    asyncMiddleware(deleteContract),
  );
module.exports = router;
