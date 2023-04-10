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

//Update player details API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const requestDetails = request.body;
  const { playerName } = requestDetails;
  const updateQueryPlayer = `
    UPDATE player_details
    SET
    player_name = '${playerName}'
    WHERE player_id = ${playerId};`;
  const updateArray = await db.run(updateQueryPlayer);
  response.send("Player Details Updated");
});

//Get matchId API
const convertCase2 = (matchIdArray) => {
  return {
    matchId: matchIdArray.match_id,
    match: matchIdArray.match,
    year: matchIdArray.year,
  };
};
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchIdQuery = `
    SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const matchIdArray = await db.get(getMatchIdQuery);
  response.send(convertCase2(matchIdArray));
});

//Get playerId and matches API
const convertCase3 = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `
  SELECT * FROM player_match_score
  NATURAL JOIN match_details WHERE player_id = ${playerId};`;
  const getDetailsMatch = await db.all(getMatchQuery);
  response.send(getDetailsMatch.map((each) => convertCase3(each)));
});

//Get matchId API

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchIdQuery = `
    SELECT player_details.player_id AS playerId,player_details.player_name AS playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id = ${matchId};`;
  const getMatchArray = await db.all(matchIdQuery);
  response.send(getMatchArray);
});

//Get players API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const playersArray = await db.get(getPlayerScored);
  response.send(playersArray);
});
module.exports = app;
