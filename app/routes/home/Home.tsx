/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { Api, GitHub } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import { usePageEffect } from "../../core/page.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useState } from "react";
window.global = window;
import { Header, Payload, SIWS } from "@web3auth/sign-in-with-solana";
import type { Adapter, WalletError } from "@solana/wallet-adapter-base";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletDialogProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-material-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  UnsafeBurnerWalletAdapter,
  PhantomWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useSnackbar } from "notistack";

function CustomConnectButton() {
  const [walletModalConfig, setWalletModalConfig] = useState(null);
  const { buttonState, onConnect, onDisconnect, onSelectWallet } =
    useWalletMultiButton({
      onSelectWallet: setWalletModalConfig,
    });
  let label;
  switch (buttonState) {
    case "connected":
      label = "Disconnect";
      break;
    case "connecting":
      label = "Connecting";
      break;
    case "disconnecting":
      label = "Disconnecting";
      break;
    case "has-wallet":
      label = "Connect";
      break;
    case "no-wallet":
      label = "Select Wallet";
      break;
  }
  const handleClick = useCallback(() => {
    switch (buttonState) {
      case "connected":
        return onDisconnect;
      case "connecting":
      case "disconnecting":
        break;
      case "has-wallet":
        return onConnect;
      case "no-wallet":
        return onSelectWallet;
        break;
    }
  }, [buttonState, onDisconnect, onConnect, onSelectWallet]);
  return (
    <>
      <button
        disabled={
          buttonState === "connecting" || buttonState === "disconnecting"
        }
        onClick={handleClick}
      >
        {label}
      </button>
      {walletModalConfig ? (
        <Modal>
          {walletModalConfig.wallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => {
                walletModalConfig.onSelectWallet(wallet.adapter.name);
                setWalletModalConfig(null);
              }}
            >
              {wallet.adapter.name}
            </button>
          ))}
        </Modal>
      ) : null}
    </>
  );
}

const Context = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new BackpackWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network],
  );

  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      enqueueSnackbar(
        error.message ? `${error.name}: ${error.message}` : error.name,
        { variant: "error" },
      );
      console.error(error, adapter);
    },
    [enqueueSnackbar],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletDialogProvider>{children}</WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

function ComponentX(): JSX.Element {
  usePageEffect({ title: "Buy now Pay later" });
  const { publicKey, disconnect, signMessage } = useWallet();
  const [status, setStatus] = useState({
    isRegister: false,
    canLend: false,
    status: "PENDING",
  });
  const checkUser = async () => {
    if (publicKey) {
      let dataPayload = await fetch(
        "http://54.255.216.111:3001/paylater/checkuser",
        {
          method: "POST",
          headers: new Headers({ "content-type": "application/json" }),
          body: JSON.stringify({
            publicKey: publicKey!.toBase58(),
          }),
        },
      );
      dataPayload = await dataPayload.json();
      console.log(dataPayload);
      setStatus({ ...dataPayload });
    } else {
    }
  };

  const register = async () => {
    if (!publicKey) return;
    try {
      const payload = new Payload();
      payload.domain = window.location.host;
      payload.address = publicKey!.toBase58();
      payload.uri = window.location.origin;
      payload.statement = "Sign in with Solana to the app.";
      payload.version = "1";
      payload.chainId = 1;
      let message = new SIWS({ payload });
      const messageText = message.prepareMessage();
      const messageEncoded = new TextEncoder().encode(messageText);
      const messageSigned = await signMessage!(messageEncoded);
      console.log({ messageSigned });

      let dataPayload = await fetch(
        "http://54.255.216.111:3001/paylater/register",
        {
          method: "POST",
          headers: new Headers({ "content-type": "application/json" }),
          body: JSON.stringify({
            publicKey: publicKey!.toBase58(),
            signedMessage: messageSigned.toString(),
          }),
        },
      );

      dataPayload = await dataPayload!.json();
      if (dataPayload.status === "success") {
        checkUser();
      }

      return messageSigned;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    checkUser();
  }, [publicKey]);

  return (
    <Container sx={{}}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gridGap: "1rem",
          width: "90vw",
          height: "90vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "",
            alignItems: "flex-start",
            gridGap: "1rem",
            width: "40%",
            height: "90%",
          }}
        >
          <Typography
            sx={{ color: "text.primary" }}
            variant="body2"
            align="center"
          >
            🌟 Introducing Buy Now Pay Later - Your Hassle-Free Shopping
            Solution!
          </Typography>
          <Typography
            sx={{ color: "text.primary" }}
            variant="body2"
            align="center"
          >
            🌟 Experience the future of shopping with our revolutionary Buy Now
            Pay Later service, designed to make your shopping journey seamless
            and stress-free. Say goodbye to the complexities of traditional
            financing and welcome a new era of convenience and flexibility,
            powered by the Solana blockchain network. 🛍️ Shop Now, Pay Later -
            No Collateral Needed!
          </Typography>
          <Typography
            sx={{ color: "text.primary" }}
            variant="body2"
            align="center"
          >
            🛍️ Forget the worries of pledging assets or undergoing lengthy
            financial procedures. With Buy Now Pay Later, you can enjoy shopping
            for your favorite items without any collateral requirements. Just
            choose what you love and leave the rest to us. 💼 Simplified Finance
            with Solana Blockchain 💼 Our state-of-the-art platform leverages
            the power of Solana, a fast and secure blockchain network, to
            streamline your shopping experience. Managing your finances has
            never been easier - all you need is a blockchain wallet, and you're
            ready to go! 💳 Interest-Free, 30-Day Grace Period
          </Typography>
          <Typography
            sx={{ color: "text.primary" }}
            variant="body2"
            align="center"
          >
            💳 Yes, you heard it right! You can pay later without any interest
            charges for up to 30 days. Take your time to enjoy your purchases
            before settling the bill, without any additional costs. 💸 Flexible
            Payment Plans 💸 We understand that everyone's financial situation
            is unique. That's why we offer the flexibility to split your
            payments into manageable chunks. Tailor your repayment schedule to
            suit your needs and budget effortlessly.
          </Typography>
          <Typography
            sx={{ color: "text.primary" }}
            variant="body2"
            align="center"
          >
            🚀 Embrace the Future of Shopping Today! 🚀 Join the growing
            community of savvy shoppers who have unlocked the true potential of
            hassle-free shopping with Buy Now Pay Later. Experience the
            convenience, security, and freedom of Solana-powered financing. Shop
            now and pay later like never before! 🔒 Your financial convenience
            and security are our top priorities. Embrace the future of shopping
            with confidence.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gridGap: "1rem",
            width: "40%",
            height: "90%",
          }}
        >
          {publicKey ? (
            <>
              <Button
                variant="outlined"
                size="large"
                children="Disconnect Wallet"
                startIcon={<GitHub />}
                onClick={(_) => disconnect()}
              />

              {!status.isRegister && (
                <>
                  <Button
                    variant="outlined"
                    size="large"
                    children="Start Register Now"
                    onClick={(_) => register()}
                  />
                </>
              )}
              {status.isRegister && (
                <>
                  <Box
                    sx={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      display: "flex",
                    }}
                  >
                    <Typography>Account Status:</Typography>
                    <Typography>
                      {status.isRegister ? "Registered" : "Not Yet"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Lend Status:</Typography>
                    <Typography>
                      {status.canLend ? "Yes" : "Not Yet"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Lend approve status:</Typography>
                    <Typography>{status.status}</Typography>
                  </Box>
                </>
              )}
            </>
          ) : (
            <>
              <Typography
                sx={{ color: "text.primary" }}
                variant="body1"
                align="center"
              >
                You have to connect your wallet to continues using service!
              </Typography>

              <WalletMultiButton />
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export function Component(): JSX.Element {
  return (
    <Context>
      <ComponentX></ComponentX>
    </Context>
  );
}
Component.displayName = "Home";
