const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log("DB error ${e.message}");
    process.exit(1);
  }
};
initializeDbAndServer();

//Get players API
const convertCase1 = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM player_details`;
  const getPlayerArray = await db.all(getPlayerQuery);
  response.send(getPlayerArray.map((each) => convertCase1(each)));
});

//Get playerId API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `
    SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const playerIdArray = await db.get(getPlayerIdQuery);
  response.send(convertCase1(playerIdArray));
});
module.exports = app;
