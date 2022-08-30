const RealTicket = artifacts.require("RealTicket");

module.exports = function (deployer) {
  deployer.deploy(RealTicket, 'RealTicket', 'TIP', 'https://realticket.lokadevops.com/api/v1/assets/', BigInt("10000000000000000"), BigInt("1000000000000000"), 1000);
};
