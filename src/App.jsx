import * as SOLANA from "@solana/web3.js";
import "./App.css";
import "css-paint-polyfill";
import { Button, Form, Input, InputNumber, Modal, Row } from "antd";
import { useState } from "react";
import _ from "lodash";

CSS.paintWorklet.addModule(
  "https://rawcdn.githack.com/CSSHoudini/css-houdini/6979b873e80f9120f52bd481fbdf2d4c60db6b19/src/connections/dist/connections.js"
);
const { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = SOLANA;

function App() {
  const [loading, setLoading] = useState(false);
  const SOLANA_CONNECTION = new Connection(clusterApiUrl("devnet"));
  const [form] = Form.useForm();

  const onSubmit = async (formValues) => {
    const { inputAmount, walletAddress } = formValues;
    if (_.isEmpty(inputAmount) || _.isEmpty(walletAddress)) {
      return Modal.error({
        title: "Invalid input !",
        onOk: () => form.resetFields(["inputAmount", "walletAddress"]),
      });
    }
    const WALLET_ADDRESS = walletAddress; //👈 Replace with your wallet address
    const AIRDROP_AMOUNT = inputAmount * LAMPORTS_PER_SOL;

    setLoading(true);

    // 1 - Request Airdrop
    const signature = await SOLANA_CONNECTION.requestAirdrop(
      new PublicKey(WALLET_ADDRESS),
      AIRDROP_AMOUNT
    );
    // 2 - Fetch the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await SOLANA_CONNECTION.getLatestBlockhash();
    // 3 - Confirm transaction success
    await SOLANA_CONNECTION.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature,
      },
      "finalized"
    );

    setLoading(false);

    // 4 - Log results
    Modal.success({
      title: "Transaction success",
      content: (
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
        >
          Check Tx details in solana explorer
        </a>
      ),
      onOk: () => form.resetFields(["inputAmount", "walletAddress"]),
    });
  };

  return (
    <div className="container">
      <p
        style={{ borderBottom: "1px solid black" }}
        className="primary-heading"
      >
        Airdrop SOL (devnet)
      </p>
      <Form
        style={{ marginTop: "50px" }}
        size="large"
        onFinish={onSubmit}
        form={form}
      >
        <Form.Item label="Airdrop" name="inputAmount">
          <Row>
            <InputNumber></InputNumber>
            <p
              style={{
                alignSelf: "center",
                fontSize: "1.25rem",
                marginLeft: "2px",
              }}
            >
              SOL
            </p>
            <p style={{ fontSize: "1.5rem", marginLeft: "5px" }}>
              to the below address
            </p>
          </Row>
        </Form.Item>
        <Form.Item name="walletAddress">
          <Input placeholder="Enter recepient wallet address..." />
        </Form.Item>
        <div style={{ width: "100%", textAlign: "center" }}>
          <Button id="send-btn" htmlType="submit" loading={loading}>
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default App;
