const paypal = require('paypal-rest-sdk');
paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AaC17qAgEh6PYcDSgp8NbUbFIssqY-ZPmd77ue_2K8vLYivjeHbeNwjGwDqS4Z3b2gh2U3Ir51ATuItA',
  client_secret:
    'EJQBMfWTfW5cU4s11l_Ftb1Oql19YE84IioRcjYTRq83YPnwfzFYb9Ny-4OG2MWIjooapnnGtOoo8026',
});

module.exports = paypal;
