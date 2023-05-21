const errorHandle = require('../middlewares/error.handle');
const ErrorResponse = require('../helpers/ErrorResponse');
const accountRouter = require('./account.router');
const industrialRouter = require('./industrial.router');
const factoryRouter = require('./factory.router');
const contractRouter = require('./contract.router');
const billRouter = require('./bill.router');

module.exports = (app) => {
  app.use('/api/accounts', accountRouter);
  app.use('/api/industrials', industrialRouter);
  app.use('/api/factories', factoryRouter);
  app.use('/api/contracts', contractRouter);
  app.use('/api/bill', billRouter);

  app.use('*', (req, res, next) => {
    throw new ErrorResponse(404, 'Page not found');
  });
  app.use(errorHandle);
};
