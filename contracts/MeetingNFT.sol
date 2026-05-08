// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface IMeetingRegistry {
    struct Meeting {
        string   meetingId;
        address  host;
        uint256  startTime;
        uint256  endTime;
        uint256  participantCount;
        bytes32  notesHash;
        string   metadataCID;
    }
    function getMeeting(string calldata meetingId) external view returns (Meeting memory);
}

/// @title  MeetingNFT
/// @notice Mints one ERC-721 receipt NFT per ended EtherXMeet session.
///         The token URI points to the IPFS receipt JSON (ipfs://<cid>).
///         Only the meeting host can mint, verified on-chain via MeetingRegistry.
contract MeetingNFT is ERC721, ERC721URIStorage {
    uint256 private _nextTokenId;
    address public immutable registry;

    mapping(string => bool)    public minted;       // meetingId → already minted?
    mapping(string => uint256) public tokenOfMeeting; // meetingId → tokenId

    event ReceiptMinted(
        string  indexed meetingId,
        address indexed host,
        uint256         tokenId,
        string          ipfsCid
    );

    constructor(address _registry) ERC721("EtherXMeet Receipt", "ETXR") {
        registry = _registry;
    }

    /// @notice Mint a receipt NFT for a completed meeting.
    ///         Caller must be the host. Meeting must be ended. One mint per meeting.
    /// @param meetingId   The room code (same string used in MeetingRegistry).
    /// @param ipfsCid     The Pinata/IPFS CID of the receipt JSON.
    function mint(string calldata meetingId, string calldata ipfsCid)
        external
        returns (uint256 tokenId)
    {
        require(!minted[meetingId], "MeetingNFT: receipt already minted");

        IMeetingRegistry.Meeting memory m = IMeetingRegistry(registry).getMeeting(meetingId);
        require(m.startTime != 0,         "MeetingNFT: meeting does not exist");
        require(m.endTime   != 0,         "MeetingNFT: meeting not ended yet");
        require(m.host == msg.sender,     "MeetingNFT: only host can mint receipt");

        tokenId = _nextTokenId++;
        minted[meetingId]        = true;
        tokenOfMeeting[meetingId] = tokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCid)));

        emit ReceiptMinted(meetingId, msg.sender, tokenId, ipfsCid);
    }

    // ── Required ERC721URIStorage overrides ───────────────────────────────────

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
