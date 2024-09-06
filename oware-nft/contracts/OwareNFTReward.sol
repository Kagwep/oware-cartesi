// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwareNFTReward is ERC721URIStorage, Ownable {
    address public minter;
    address public marketplace;

    struct NFTData {
        string rank;
        uint256 score;
        uint256 minerals;
    }

    mapping(uint256 => NFTData) public nftData;
    mapping(address => mapping(string => bool)) public hasReceivedRankNFT;
    mapping(address => mapping(string => bool)) public hasReceivedTournamentRankNFT;

    event RankNFTMinted(address indexed player, uint256 tokenId, string rank, uint256 score);
    event TournamentRankNFTMinted(address indexed player, uint256 tokenId, string tournamentRank, uint256 minerals);
    event MinterUpdated(address newMinter);
    event MarketplaceUpdated(address newMarketplace);
    event NFTAddedToMarketplace(uint256 tokenId);

    constructor(address initialOwner) ERC721("OwareNFTReward", "OWARE") Ownable(initialOwner) {
        minter = initialOwner;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Caller is not the minter");
        _;
    }

    function setMinter(address newMinter) public onlyOwner {
        require(newMinter != address(0), "New minter is the zero address");
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function setMarketplace(address newMarketplace) public onlyOwner {
        require(newMarketplace != address(0), "New marketplace is the zero address");
        marketplace = newMarketplace;
        emit MarketplaceUpdated(newMarketplace);
    }

    function mintRankNFT(address player, string memory rank, uint256 score, string memory tokenURI) public onlyMinter returns (uint256) {
        require(!hasReceivedRankNFT[player][rank], "Player already has an NFT for this rank");

        uint256 tokenId = uint256(keccak256(abi.encodePacked(player, rank, block.timestamp)));

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftData[tokenId] = NFTData(rank, score, 0);
        hasReceivedRankNFT[player][rank] = true;

        emit RankNFTMinted(player, tokenId, rank, score);

        return tokenId;
    }

    function mintTournamentRankNFT(address player, string memory tournamentRank, uint256 minerals, string memory tokenURI) public onlyMinter returns (uint256) {
        require(!hasReceivedTournamentRankNFT[player][tournamentRank], "Player already has an NFT for this tournament rank");

        uint256 tokenId = uint256(keccak256(abi.encodePacked(player, tournamentRank, block.timestamp)));

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftData[tokenId] = NFTData(tournamentRank, 0, minerals);
        hasReceivedTournamentRankNFT[player][tournamentRank] = true;

        emit TournamentRankNFTMinted(player, tokenId, tournamentRank, minerals);

        return tokenId;
    }

    function addToMarketplace(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        require(marketplace != address(0), "Marketplace not set");
        
        approve(marketplace, tokenId);
        
        emit NFTAddedToMarketplace(tokenId);
    }

    function calculateRank(uint256 score) public pure returns (string memory) {
        if (score < 1000) return "Beginner";
        if (score < 2000) return "Intermediate";
        if (score < 3000) return "Advanced";
        if (score < 4000) return "Expert";
        return "Legend";
    }

    function calculateTournamentRank(uint256 minerals) public pure returns (string memory) {
        if (minerals < 100) return "Bronze";
        if (minerals < 500) return "Silver";
        if (minerals < 1000) return "Gold";
        if (minerals < 2000) return "Platinum";
        return "Diamond";
    }
}