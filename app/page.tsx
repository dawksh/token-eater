"use client"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract()
  const [tx, setTx] = useState<any>("")
  return (
    <div className="grid grid-rows-[auto_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto mt-4">
        <ConnectButton
          label="Connect Wallet to Play"
          chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
          showBalance={{ smallScreen: false, largeScreen: false }}
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
        />
        <button
          disabled={!isConnected}
          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white font-bold text-lg py-3 px-8 shadow-lg transition-all duration-150 tracking-wide font-[family-name:var(--font-geist-sans)]"
          onClick={async () => {
            const tx = await writeContractAsync({
              address: "0xbA6D779Ebf3EADA6c805c29215751004dBDa46ef",
              abi: [
                {
                  "inputs": [
                    {
                      "internalType": "string",
                      "name": "_poolId",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "_owner",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "_lockTimestamp",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "nonpayable",
                  "type": "constructor"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                    }
                  ],
                  "name": "OwnableInvalidOwner",
                  "type": "error"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "account",
                      "type": "address"
                    }
                  ],
                  "name": "OwnableUnauthorizedAccount",
                  "type": "error"
                },
                {
                  "inputs": [],
                  "name": "ReentrancyGuardReentrantCall",
                  "type": "error"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "previousOwner",
                      "type": "address"
                    },
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "newOwner",
                      "type": "address"
                    }
                  ],
                  "name": "OwnershipTransferred",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": false,
                      "internalType": "address[]",
                      "name": "users",
                      "type": "address[]"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256[]",
                      "name": "newShares",
                      "type": "uint256[]"
                    }
                  ],
                  "name": "SharesBatchUpdated",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "user",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "oldShare",
                      "type": "uint256"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "newShare",
                      "type": "uint256"
                    }
                  ],
                  "name": "SharesUpdated",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "user",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "newShare",
                      "type": "uint256"
                    }
                  ],
                  "name": "TokensDeposited",
                  "type": "event"
                },
                {
                  "anonymous": false,
                  "inputs": [
                    {
                      "indexed": true,
                      "internalType": "address",
                      "name": "user",
                      "type": "address"
                    },
                    {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "TokensWithdrawn",
                  "type": "event"
                },
                {
                  "inputs": [],
                  "name": "depositTokens",
                  "outputs": [],
                  "stateMutability": "payable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "name": "depositors",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "emergencyWithdraw",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "getAllDepositors",
                  "outputs": [
                    {
                      "internalType": "address[]",
                      "name": "",
                      "type": "address[]"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "getContractBalance",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "getPoolInfo",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "_poolId",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "_totalDeposits",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "_totalDepositors",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "_contractBalance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "_lockTimestamp",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "getRemainingLockTime",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "user",
                      "type": "address"
                    }
                  ],
                  "name": "getUserInfo",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "deposits",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "share",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "isWithdrawalLocked",
                  "outputs": [
                    {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "lockTimestamp",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "owner",
                  "outputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "poolId",
                  "outputs": [
                    {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "recalculateShares",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "renounceOwnership",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [],
                  "name": "totalDeposits",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "newOwner",
                      "type": "address"
                    }
                  ],
                  "name": "transferOwnership",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address[]",
                      "name": "users",
                      "type": "address[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "newShares",
                      "type": "uint256[]"
                    }
                  ],
                  "name": "updateSharesBatch",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "user",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "newShare",
                      "type": "uint256"
                    }
                  ],
                  "name": "updateUserShare",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "name": "userDeposits",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "address",
                      "name": "",
                      "type": "address"
                    }
                  ],
                  "name": "userShares",
                  "outputs": [
                    {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                    }
                  ],
                  "stateMutability": "view",
                  "type": "function"
                },
                {
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "withdrawTokens",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                },
                {
                  "stateMutability": "payable",
                  "type": "receive"
                }
              ],
              functionName: "depositTokens",
              args: [],
              value: parseEther("0.000000001"),
            })
            setTx(tx)
          }}
        >
          Deposit and Play
        </button>
        {tx !== "" && <div>
          <Link href="/play">
            <h1>Play</h1>
          </Link>
          <p>
            <a href={`https://testnet.monad.xyz/tx/${tx}`} target="_blank" rel="noopener noreferrer">
              View on Monad Explorer
            </a>
          </p>
        </div>}
      </div>

    </div>
  );
}
