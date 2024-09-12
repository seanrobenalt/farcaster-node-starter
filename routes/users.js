var express = require("express");
var router = express.Router();
const User = require("../models/user");
const {
  hexStringToBytes,
  NobleEd25519Signer,
  FarcasterNetwork,
  getInsecureHubRpcClient,
  makeCastAdd,
} = require("@farcaster/hub-nodejs");

router.post("/add", async (req, res) => {
  try {
    const { fid } = req.body;

    const existingUser = await User.findOne({ fid });

    if (existingUser) {
      return res.status(400).send("User with this fid already exists");
    }

    const newUser = new User({ fid, signerKey });
    await newUser.save();

    res.status(201).send("User added successfully");
  } catch (error) {
    res.status(500).send("Error adding user: " + error.message);
  }
});

router.put("/update/:fid", async (req, res) => {
  try {
    const { fid } = req.params;
    const { signerKey } = req.body;

    const user = await User.findOne({ fid });

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.signerKey = signerKey;

    await user.save();

    res.status(200).send("User updated successfully");
  } catch (error) {
    res.status(500).send("Error updating user: " + error.message);
  }
});

router.post("/cast/:fid", async (req, res) => {
  try {
    const { fid } = req.params;

    const user = await User.findOne({ fid });

    const signerKey = user.signerKey;

    const privateKeyBytes = hexStringToBytes(signerKey.slice(2));
    const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

    const dataOptions = {
      fid,
      network: FarcasterNetwork.TESTNET,
    };

    // If client does not use SSL.
    const client = getInsecureHubRpcClient(HUB_URL);

    // If client uses SSL and requires authentication.
    // const client = getSSLHubRpcClient(HUB_URL);
    // const authMetadata = getAuthMetadata("username", "password");
    // const result = await client.submitMessage(message, authMetadata);

    /**
     * Example 1: A cast with no mentions
     *
     * "This is a cast with no mentions"
     */
    const cast = await makeCastAdd(
      {
        text: "This is a cast with no mentions",
        embeds: [],
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
      },
      dataOptions,
      ed25519Signer
    );

    client.submitMessage(cast);

    const createdCast = cast._unsafeUnwrap();

    res.status(201).send(createdCast);
  } catch (error) {
    res.status(500).send("Error casting: " + error.message);
  }
});

module.exports = router;
