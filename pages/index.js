import { useMemo, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";

import { ECHO_ACCOUNT_DATA_LAYOUT } from "../utils";

const user = require("../devnet.json");

export default function Home() {
  const connection = useMemo(() => new Connection(clusterApiUrl('devnet')), []);
  const feePayer = Keypair.fromSecretKey(Uint8Array.from(user));
  const programId = new PublicKey('Fu5cEqxpbiwFdZz6zGgbLqyoUm2vz7RfgKBRU5V4zCQk');
  const [echoAddress, setEchoAddres] = useState();
  const [echoAccountData, setEchoAccountData] = useState();

  const initializeEchoAccount = async() => {
    let echoAccount = Keypair.generate();
    let transaction = new Transaction();
    let signers = [feePayer, echoAccount];
    let accountIx = SystemProgram.createAccount({
      fromPubkey: feePayer.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(40),
      newAccountPubkey: echoAccount.publicKey,
      programId,
      space: 40
    })
    transaction.add(accountIx);
    let echoIx = new TransactionInstruction({
      keys: [
        { pubkey: echoAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: feePayer.publicKey, isSigner: true, isWritable: false }
      ],
      programId,
      data: Buffer.from(new Uint8Array([1]))
    })
    transaction.add(echoIx);
    const recentBlockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = feePayer.publicKey;
    const signature = await connection.sendTransaction(transaction, signers);
    setEchoAddres(echoAccount);
    const result = await connection.confirmTransaction(signature);
    console.log(result);
    fetchEchoAccount(echoAccount.publicKey);
  }

  const fetchEchoAccount = async(echoAddress) => {
    const echoAccount = await connection.getAccountInfo(echoAddress);
    const decodedEchoLayout = ECHO_ACCOUNT_DATA_LAYOUT.decode(echoAccount.data);
    setEchoAccountData(decodedEchoLayout.data);
  }

  return (
    <div className="flex flex-row items-center justify-center h-screen">
      {!echoAddress && (
        <button 
          className="p-2 text-white bg-purple-400 rounded"
          onClick={initializeEchoAccount}
        >
          Initialize Echo Account
        </button>
      )}
      {echoAddress && (
        <div className="flex flex-col items-center space-x-4">
          <p className="font-medium text-black text-[16px] underline">Data in Echo Account</p>
          <p className="text-purple-400">{echoAccountData}</p>
        </div>
      )}
    </div>
  )
}
