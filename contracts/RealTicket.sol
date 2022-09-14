// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "./ERC721Status.sol";

contract RealTicket is
  Context,
  AccessControlEnumerable,
  ERC721Enumerable,
  ERC721Burnable,
  ERC721Pausable,
  ERC721Status
{
  using Counters for Counters.Counter;
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  bytes32 public constant BOUNCER_ROLE = keccak256("BOUNCER_ROLE");
  Counters.Counter private _tokenIdTracker;

  string private _baseTokenURI;
  uint256 private _price;
  uint256 private _fee;
  uint256 private _capacity;
  uint256 private _balance;

  mapping (uint256 => uint256) _sale;

  event OnSale(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);
  event Sold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);

  constructor(
      string memory name,
      string memory symbol,
      string memory baseTokenURI,
      uint256 price,
      uint256 fee,
      uint256 capacity
  ) ERC721(name, symbol) {
      _baseTokenURI = baseTokenURI;
      _price = price;
      _fee = fee;
      _capacity = capacity;

      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(MANAGER_ROLE, _msgSender());
      _setupRole(BOUNCER_ROLE, _msgSender());
  }

  function _baseURI() internal view virtual override returns (string memory) {
      return _baseTokenURI;
  }

  function pause() public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      _pause();
  }

  function unpause() public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      _unpause();
  }

  function getPrice() public view virtual returns (uint256) {
      return _price;
  }

  function getFee() public view virtual returns (uint256) {
      return _fee;
  }

  function getCapacity() public view virtual returns (uint256) {
      return _capacity;
  }

  function getBalance() public view virtual returns (uint256) {
      return _balance;
  }

  function getSalePrice(uint256 tokenId) public view virtual returns (uint256) {
      return _sale[tokenId];
  }

  function setBaseFee(uint256 fee) public virtual {
      require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "RealTicket: must have default admin role");
      _fee = fee;
  }

  function setPrice(uint256 price) public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      _price = price;
  }

  function setCapacity(uint256 capacity) public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      require(capacity >= _tokenIdTracker.current(), "RealTicket: capacity lower than existing tickets");
      _capacity = capacity;
  }

  function setSettings(uint256 fee, uint256 price, uint256 capacity) public virtual {
      require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "RealTicket: must have default admin role");
      setBaseFee(fee);
      setPrice(price);
      setCapacity(capacity);
  }

  function setSalePrice(uint256 tokenId, uint256 price) public {
      require(_isApprovedOrOwner(_msgSender(), tokenId), "RealTicket: setSalePrice caller is not owner nor approved");
      require(price <= _price, "RealTicket: price can't be higher than _basePrice");
      _sale[tokenId] = price;
      emit OnSale(_msgSender(), address(0), tokenId, price);
  }

  function bound(uint256 tokenId) public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      require(ERC721._exists(tokenId), "RealTicket: ticket not existent");
      _boundTicket(tokenId);
  }

  function useTicket(uint256 tokenId) public virtual {
      require(hasRole(BOUNCER_ROLE, _msgSender()), "RealTicket: must have bouncer role");
      require(ERC721._exists(tokenId), "RealTicket: ticket not existent");
      _useTicket(tokenId);
  }

  function blockTicket(uint256 tokenId) public virtual {
      require(hasRole(BOUNCER_ROLE, _msgSender()), "RealTicket: must have bouncer role");
      require(ERC721._exists(tokenId), "RealTicket: ticket not existent");
      _blockTicket(tokenId);
  }

  function mint(address to) public virtual {
      require(hasRole(MANAGER_ROLE, _msgSender()), "RealTicket: must have manager role");
      require(_tokenIdTracker.current() < _capacity, "RealTicket: capacity already reached");

      _mint(to, _tokenIdTracker.current());
      _tokenIdTracker.increment();
  }

  function firstBuy() public payable {
      require(msg.value >= _price + _fee, "RealTicket: value not enough to cover price and fee");
      require(_tokenIdTracker.current() < _capacity, "RealTicket: capacity already reached");

      _balance += msg.value;
      _mint(_msgSender(), _tokenIdTracker.current());
      emit Sold(address(0), _msgSender(), _tokenIdTracker.current(), _price);
      _tokenIdTracker.increment();
  }

  function secondBuy(uint256 tokenId, address payable from) public payable {
      require(_sale[tokenId] > 0, "RealTicket: item not for sale");
      require(msg.value >= _sale[tokenId] + _fee, "RealTicket: value not enough to cover price and fee");
      require(from == ERC721.ownerOf(tokenId), "RealTicket: from is not the tokenId owner");
      from.transfer(_sale[tokenId]);
      _balance += msg.value - _sale[tokenId];
      super._transfer(ERC721.ownerOf(tokenId), _msgSender(), tokenId);
      emit Sold(from, _msgSender(), tokenId, _sale[tokenId]);
  }

  function withdrawal(address payable to) public payable {
    require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "RealTicket: must have default admin role");
    to.transfer(_balance);
    _balance = 0;
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable, ERC721Status) {
      super._beforeTokenTransfer(from, to, tokenId);
      _sale[tokenId] = 0;
  }

  function supportsInterface(bytes4 interfaceId)
      public
      view
      virtual
      override(AccessControlEnumerable, ERC721, ERC721Enumerable)
      returns (bool)
  {
      return super.supportsInterface(interfaceId);
  }

}
