const RealTicket = artifacts.require("RealTicket");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("RealTicket", function (accounts) {
  beforeEach(async function () {
    this.ticket = await RealTicket.new('RealTicket', 'TIP', 'https://realticket.lokadevops.com/api/v1/assets/', BigInt("10000000000000000"), BigInt("1000000000000000"), 1000);
    this.err = "Error: Returned error: VM Exception while processing transaction: revert ";
  });

  it("test constructor", async function () {
    await RealTicket.deployed();

    contract_name = await this.ticket.name();
    contract_symbol = await this.ticket.symbol();
    base_price = await this.ticket.getPrice();
    base_fee = await this.ticket.getFee();

    assert.equal(await contract_name, 'RealTicket', "KO - Incorrect Name");
    assert.equal(await contract_symbol, 'TIP', "KO - Incorrect Symbol");
    assert.equal(await base_price, BigInt("10000000000000000"), "KO - Incorrect Price");
    assert.equal(await base_fee, BigInt("1000000000000000"), "KO - Incorrect Fee");

    return;
  });

  it("test roles", async function () {
    await RealTicket.deployed();

    roles = [
      await this.ticket.DEFAULT_ADMIN_ROLE(),
      await this.ticket.MANAGER_ROLE(),
      await this.ticket.BOUNCER_ROLE()
    ]

    for (let i = 0; i < roles.length; i++) {
      counter = await this.ticket.getRoleMemberCount(roles[i]);
      assert.equal(await counter, 1, "KO - Incorrect Role Counter");

      owner = await this.ticket.getRoleMember(roles[i], 0);
      assert.equal(await owner, accounts[0], "KO - Incorrect Owner");

      isTrue = await this.ticket.hasRole(roles[i], accounts[0]);
      assert.equal(await isTrue, true, "KO - Incorrect Owner");

      await this.ticket.grantRole(roles[i], accounts[1]);

      counter = await this.ticket.getRoleMemberCount(roles[i]);
      assert.equal(await counter, 2, "KO - Incorrect Role Counter");

      owner = await this.ticket.getRoleMember(roles[i], 1);
      assert.equal(await owner, accounts[1], "KO - Incorrect Owner");

      isTrue = await this.ticket.hasRole(roles[i], accounts[1]);
      assert.equal(await isTrue, true, "KO - Incorrect Owner");

      await this.ticket.revokeRole(roles[i], accounts[1]);

      counter = await this.ticket.getRoleMemberCount(roles[i]);
      assert.equal(await counter, 1, "KO - Incorrect Role Counter");

      isFalse = await this.ticket.hasRole(roles[i], accounts[1]);
      assert.equal(await isFalse, false, "KO - Incorrect Owner");

    }

    return
  });

  it("test minting and burning", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    owner = await this.ticket.ownerOf(0);
    balance = await this.ticket.balanceOf(accounts[0]);
    tokenURI = await this.ticket.tokenURI(0);
    approval = await this.ticket.getApproved(0);

    assert.equal(await owner, accounts[0], "KO - Incorrect Owner");
    assert.equal(await balance, 1, "KO - Incorrect Balance");
    assert.equal(await tokenURI, 'https://realticket.lokadevops.com/api/v1/assets/0', "KO - Incorrect TokenURI");
    assert.equal(await approval, "0x0000000000000000000000000000000000000000", "KO - Incorrect Approval");

    await this.ticket.burn(0);
    try {
      await this.ticket.ownerOf(0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721: owner query for nonexistent token");
    }
    balance = await this.ticket.balanceOf(accounts[0]);
    try {
      await this.ticket.tokenURI(0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721Metadata: URI query for nonexistent token");
    }

    assert.equal(await balance, 0, "KO - Incorrect Balance");

    return
  });

  it("test pausing", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    start = await this.ticket.paused();
    await this.ticket.pause();
    paused = await this.ticket.paused();
    try {
      await this.ticket.transferFrom(accounts[0], accounts[1], 0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721Pausable: token transfer while paused -- Reason given: ERC721Pausable: token transfer while paused.");
    }
    await this.ticket.unpause();
    unpaused = await this.ticket.paused();
    await this.ticket.transferFrom(accounts[0], accounts[1], 0);

    assert.equal(await start, false, "KO - Incorrect Pausing");
    assert.equal(await paused, true, "KO - Incorrect Pausing");
    assert.equal(await unpaused, false, "KO - Incorrect Pausing");

    return
  });

  it("test transfering", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    await this.ticket.transferFrom(accounts[0], accounts[1], 0);
    owner = await this.ticket.ownerOf(0);
    old_balance = await this.ticket.balanceOf(accounts[0]);
    new_balance = await this.ticket.balanceOf(accounts[1]);

    assert.equal(await owner, accounts[1], "KO - Incorrect Bounding");
    assert.equal(await old_balance, 0, "KO - Incorrect Balance");
    assert.equal(await new_balance, 1, "KO - Incorrect Balance");

    try {
      await this.ticket.transferFrom(accounts[1], accounts[0], 0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.");
    }

    return
  });

  it("test safe transfering", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    await this.ticket.safeTransferFrom(accounts[0], accounts[1], 0);
    owner = await this.ticket.ownerOf(0);
    old_balance = await this.ticket.balanceOf(accounts[0]);
    new_balance = await this.ticket.balanceOf(accounts[1]);

    assert.equal(await owner, accounts[1], "KO - Incorrect Bounding");
    assert.equal(await old_balance, 0, "KO - Incorrect Balance");
    assert.equal(await new_balance, 1, "KO - Incorrect Balance");

    try {
      await this.ticket.safeTransferFrom(accounts[1], accounts[0], 0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721: transfer caller is not owner nor approved -- Reason given: ERC721: transfer caller is not owner nor approved.");
    }

    return
  });

  it("test transfering from", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    approval = await this.ticket.approve(accounts[2], 0);
    approval = await this.ticket.getApproved(0);
    assert.equal(await approval, accounts[2], "KO - Incorrect Approval");

    await this.ticket.transferFrom(accounts[0], accounts[1], 0, {from: accounts[2]});

    owner = await this.ticket.ownerOf(0);
    old_balance = await this.ticket.balanceOf(accounts[0]);
    new_balance = await this.ticket.balanceOf(accounts[1]);

    assert.equal(await owner, accounts[1], "KO - Incorrect Bounding");
    assert.equal(await old_balance, 0, "KO - Incorrect Balance");
    assert.equal(await new_balance, 1, "KO - Incorrect Balance");

    return
  });

  it("test safe transfering from", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    approval = await this.ticket.approve(accounts[2], 0);
    approval = await this.ticket.getApproved(0);
    assert.equal(await approval, accounts[2], "KO - Incorrect Approval");

    await this.ticket.safeTransferFrom(accounts[0], accounts[1], 0, {from: accounts[2]});

    owner = await this.ticket.ownerOf(0);
    old_balance = await this.ticket.balanceOf(accounts[0]);
    new_balance = await this.ticket.balanceOf(accounts[1]);

    assert.equal(await owner, accounts[1], "KO - Incorrect Bounding");
    assert.equal(await old_balance, 0, "KO - Incorrect Balance");
    assert.equal(await new_balance, 1, "KO - Incorrect Balance");

    return
  });

  it("test status: use & block", async function () {
    await RealTicket.deployed();

    try {
      await this.ticket.useTicket(0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: ticket not existent -- Reason given: RealTicket: ticket not existent.");
    }

    try {
      await this.ticket.blockTicket(1);
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: ticket not existent -- Reason given: RealTicket: ticket not existent.");
    }

    await this.ticket.mint(accounts[0]);
    await this.ticket.mint(accounts[0]);
    ready = await this.ticket.getStatus(0);

    await this.ticket.useTicket(0);
    used = await this.ticket.getStatus(0);
    await this.ticket.blockTicket(1);
    blocked = await this.ticket.getStatus(1);

    assert.equal(await this.ticket.getEnumValue(used), "USED", "KO - Incorrect Status");
    assert.equal(await this.ticket.getEnumValue(blocked), "BLOCKED", "KO - Incorrect Status");

    try {
      await this.ticket.useTicket(1);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721Status: blocked -- Reason given: ERC721Status: blocked.");
    }

    try {
      await this.ticket.blockTicket(0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721Status: already used -- Reason given: ERC721Status: already used.");
    }

    return
  });

  it("test status: bound", async function () {
    await RealTicket.deployed();

    try {
      await this.ticket.bound(0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: ticket not existent -- Reason given: RealTicket: ticket not existent.");
    }

    await this.ticket.mint(accounts[0]);
    unbounded = await this.ticket.getStatus(0);
    await this.ticket.bound(0);
    bounded = await this.ticket.getStatus(0);
    try {
      await this.ticket.transferFrom(accounts[0], accounts[1], 0);
    } catch (e) {
      assert.equal(e.toString(), this.err + "ERC721Status: not ready -- Reason given: ERC721Status: not ready.");
    }

    assert.equal(await unbounded, 0, "KO - Incorrect Status");
    assert.equal(await bounded, 1, "KO - Incorrect Status");

    return
  });

  it("test sale price", async function () {
    await RealTicket.deployed();

    await this.ticket.mint(accounts[0]);
    await this.ticket.mint(accounts[1]);

    initial_price = await this.ticket.getSalePrice(0);

    try {
      await this.ticket.setSalePrice(1, BigInt("100000000000000000"));
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: setSalePrice caller is not owner nor approved -- Reason given: RealTicket: setSalePrice caller is not owner nor approved.");
    }

    try {
      await this.ticket.setSalePrice(0, BigInt("10000000000000000000"));
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: price can't be higher than _basePrice -- Reason given: RealTicket: price can't be higher than _basePrice.");
    }

    await this.ticket.setSalePrice(0, BigInt("10000000000000000"));

    final_price = await this.ticket.getSalePrice(0);

    assert.equal(await initial_price, 0, "KO - Incorrect Price");
    assert.equal(await final_price, BigInt("10000000000000000"), "KO - Incorrect Price");

    return
  });

  it("test first buy", async function () {
    await RealTicket.deployed();

    try {
      await this.ticket.firstBuy({from: accounts[2], value: 10000000000000000});
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: value not enough to cover price and fee -- Reason given: RealTicket: value not enough to cover price and fee.");
    }

    await this.ticket.firstBuy({from: accounts[2], value: 11000000000000000});

    owner = await this.ticket.ownerOf(0);

    assert.equal(await owner, accounts[2], "KO - Incorrect Owner");

    return
  });

  it("test second buy", async function () {
    await RealTicket.deployed();

    await this.ticket.firstBuy({value: 11000000000000000});
    await this.ticket.setSalePrice(0, BigInt("10000000000000000"));

    initial_owner = await this.ticket.ownerOf(0);
    price = await this.ticket.getSalePrice(0);

    try {
      await this.ticket.secondBuy(0, accounts[0], {from: accounts[2], value: 10000000000000000});
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: value not enough to cover price and fee -- Reason given: RealTicket: value not enough to cover price and fee.");
    }

    await this.ticket.secondBuy(0, accounts[0], {from: accounts[2], value: 20000000000000000});

    final_owner = await this.ticket.ownerOf(0);
    reset_price = await this.ticket.getSalePrice(0);

    assert.equal(await initial_owner, accounts[0], "KO - Incorrect Owner");
    assert.equal(await price, BigInt("10000000000000000"), "KO - Incorrect Price");
    assert.equal(await final_owner, accounts[2], "KO - Incorrect Owner");
    assert.equal(await reset_price, BigInt("0"), "KO - Incorrect Price");

    return
  });

  it("test reset price on transfer", async function () {
    await RealTicket.deployed();

    await this.ticket.firstBuy({value: 11000000000000000});
    await this.ticket.setSalePrice(0, BigInt("10000000000000000"));

    initial_owner = await this.ticket.ownerOf(0);
    price = await this.ticket.getSalePrice(0);

    await this.ticket.transferFrom(accounts[0], accounts[1], 0);

    final_owner = await this.ticket.ownerOf(0);
    reset_price = await this.ticket.getSalePrice(0);

    assert.equal(await initial_owner, accounts[0], "KO - Incorrect Owner");
    assert.equal(await price, BigInt("10000000000000000"), "KO - Incorrect Price");
    assert.equal(await final_owner, accounts[1], "KO - Incorrect Owner");
    assert.equal(await reset_price, BigInt("0"), "KO - Incorrect Price");

    return
  });

  it("test withdrawal", async function () {
    await RealTicket.deployed();

    initial_balance = await web3.eth.getBalance(accounts[1]);

    try {
      await this.ticket.withdrawal(accounts[1], {from: accounts[2]});
    } catch (e) {
      assert.equal(e.toString(), this.err + "RealTicket: must have default admin role -- Reason given: RealTicket: must have default admin role.");
    }

    await this.ticket.firstBuy({value: 11000000000000000});
    await this.ticket.withdrawal(accounts[1]);

    final_balance = await web3.eth.getBalance(accounts[1]);

    assert.equal(await final_balance - initial_balance, 11000000000000000, "KO - Incorrect Balance");

    await this.ticket.withdrawal(accounts[1]);

    nothing_to_withdrawal = await web3.eth.getBalance(accounts[1]);

    assert.equal(await final_balance, nothing_to_withdrawal, "KO - Incorrect Balance");

    return
  });

  it("test change settings", async function () {
    await RealTicket.deployed();
    assert.equal(await this.ticket.getFee(), "1000000000000000", "KO - Incorrect Fee");
    assert.equal(await this.ticket.getPrice(), "10000000000000000", "KO - Incorrect Price");
    assert.equal(await this.ticket.getCapacity(), "1000", "KO - Incorrect Capacity");

    await this.ticket.setSettings(1, 2, 3);

    assert.equal(await this.ticket.getFee(), "1", "KO - Incorrect Fee");
    assert.equal(await this.ticket.getPrice(), "2", "KO - Incorrect Price");
    assert.equal(await this.ticket.getCapacity(), "3", "KO - Incorrect Capacity");

    await this.ticket.setBaseFee(10);
    await this.ticket.setPrice(20);
    await this.ticket.setCapacity(30);

    assert.equal(await this.ticket.getFee(), "10", "KO - Incorrect Fee");
    assert.equal(await this.ticket.getPrice(), "20", "KO - Incorrect Price");
    assert.equal(await this.ticket.getCapacity(), "30", "KO - Incorrect Capacity");

    return
  });

});
