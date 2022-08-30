// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC721Status is ERC721 {
  enum StatusType{ READY, BOUNDED, USED, BLOCKED }

  event StatusChange(uint256 tokenId, StatusType status);

  mapping (uint256 => StatusType) _status;

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
      require(_status[tokenId] == StatusType.READY, "ERC721Status: not ready");
      super._beforeTokenTransfer(from, to, tokenId);
  }

  function getStatus(uint256 tokenId) public view virtual returns (StatusType) {
      return _status[tokenId];
  }

  function getEnumValue(StatusType _statusId) public view virtual returns (string memory) {
      // Loop through possible options
      if (StatusType.READY == _statusId) return "READY";
      if (StatusType.BOUNDED == _statusId) return "BOUNDED";
      if (StatusType.USED == _statusId) return "USED";
      if (StatusType.BLOCKED == _statusId) return "BLOCKED";
      return "NONE";
  }

  modifier isUsable(uint256 tokenId) {
      require(_status[tokenId] != StatusType.USED, "ERC721Status: already used");
      require(_status[tokenId] != StatusType.BLOCKED, "ERC721Status: blocked");
      _;
  }

  function _boundTicket(uint256 tokenId) internal virtual isUsable(tokenId) {
      _status[tokenId] = StatusType.BOUNDED;
      emit StatusChange(tokenId, StatusType.BOUNDED);
  }

  function _useTicket(uint256 tokenId) internal virtual isUsable(tokenId) {
      _status[tokenId] = StatusType.USED;
      emit StatusChange(tokenId, StatusType.USED);
  }

  function _blockTicket(uint256 tokenId) internal virtual isUsable(tokenId) {
      _status[tokenId] = StatusType.BLOCKED;
      emit StatusChange(tokenId, StatusType.BLOCKED);
  }

}
