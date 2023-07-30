import { CandyPay } from "@candypay/checkout-sdk";
import bs58 from "bs58";
import dotenv from "dotenv";
import axios from "axios";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
} from "@solana/web3.js";
dotenv.config();

const run = async () => {
  const candypay = new CandyPay({
    api_keys: {
      private_api_key: process.env.A_PRIVATE,
      public_api_key: process.env.B_PUBLIC,
    },
    network: "devnet",
    config: {
      collect_shipping_address: false,
    },
  });

  const session = await candypay.session.create({
    success_url: "https://your-website.com/checkout/success",
    cancel_url: "https://your-website.com/checkout/cancel",
    tokens: ["sol"],
    items: [
      {
        name: "Throwback Hip Bag",
        price: 0.009, // value in USD
        image: "https://imgur.com/EntGcVQ.png",
        quantity: 100,
        size: "M", // optional
      },
    ],
    shipping_fees: 0.03, // optional | value in USD
    metadata: {
      customer_name: "Jon Doe tên khách hàng",
    }, // optional
    //   custom_data: {
    //     name: "Aeyakovenko",
    //     image: "https://i.ibb.co/chtf9qc/2691.png",
    //     wallet_address: "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY",
    //   }, // optional
  });
  console.log(session);
  const paymentURL = candypay.session.generatePaymentURL({
    session_id: session.session_id,
  });
  console.log(paymentURL);

  const metadata = await candypay.session.metadata({
    session_id: session.session_id,
  });

  console.log(metadata);
};

const amount = 0.003;
const fromPubkey = "GtWKrDC24YDdXL13s2ygg5byvj5YNi6qKiTftWNzsxvP";
const fromPrivate =
  "4skzfpuQrCZePP7XRRmsgTdhciPPDpEqpvr1UaguPeMkq2TxT8HMP9CrctfyHoEzvgkLopXMFPZqSQDMBSyHreqR";
const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivate));
const connection = new Connection(
  "https://rpc.helius.xyz/?api-key=3da33b50-eda1-4739-a163-6aa8e3f8ac0b",
  "confirmed",
);

const genTransaction = async () => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: new PublicKey("BiBvBCUaQbNjTb5qchq95dqbudi1dX7nQT2qTaTv2rfp"),
      lamports: LAMPORTS_PER_SOL * amount,
    }),
  );

  return transaction;
};

const candypay = new CandyPay({
  api_keys: {
    private_api_key: process.env.A_PRIVATE,
    public_api_key: process.env.B_PUBLIC,
  },
  network: "devnet",
  config: {
    collect_shipping_address: false,
  },
});

const updateTxn = async (session_id, signature, intent_secret_key) => {
  const options = {
    method: "PATCH",
    url: `https://candypay-checkout-production.up.railway.app/api/v1/intent`,
    headers: {
      Authorization: `Bearer ${intent_secret_key}`,
    },
    data: {
      session_id: session_id,
      signature: signature,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const res = await axios(options);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const handler = async () => {
  try {
    // const response = await candypay.paymentIntent.create({
    //   tokens: [],
    //   items: [
    //     {
    //       name: "Test Product 1",
    //       image: "https://candypay.fun/assets/logo.png",
    //       price: 0.003,
    //       quantity: 1,
    //     },
    //   ],
    // });

    // let intent_secret_key = response.intent_secret_key;
    // let intent_id = response.intent_id;
    // let merchant = response.metadata.merchant;
    // let created_at = response.metadata.created_at;
    // // console.log(response.metadata);
    // console.log(response, { intent_secret_key, intent_id, created_at });

    let tx = await genTransaction();
    console.log("tx", tx);

    console.log("fromKeyPair", fromKeypair);

    // let x = await updateTxn(
    //   intent_id,
    //   "93ihRvRniv8rmnnwGaYHKHPKPut83QPebDxaz7QrYDgQeJCaNj4FraehB76B8PfiJuReVNUpwj85JPaekngX7xy",
    //   intent_secret_key
    // );

    // console.log({ x });
    // return

    const signature = await sendAndConfirmTransaction(connection, tx, [
      fromKeypair,
    ]);

    console.log("signature", signature);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const intent = async () => {
  const x = await handler();
  console.log(x);
};

// run();
intent();
