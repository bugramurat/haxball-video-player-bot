// BUGGYRAZ
const HaxballJS = require("haxball.js") // Required to connect to Haxball Headless API 
const fs = require("fs") // Required to work with the file system

//----------------------- !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------
//------------------------ ROOM CONFIGS -----------------------------------------
const HEADLESS_TOKEN = "insert_your_headless_haxball_token_here" // You must paste your token here to run this bot (https://www.haxball.com/headlesstoken)
const ROOM_NAME = "your_room_name"
const MAX_PLAYER_NUMBER = 12
const IS_PUBLIC = true

const TIME_LIMIT = 0
const SCORE_LIMIT = 0
const IS_TEAMS_LOCKED = true

//------------------------ STADIUM CONFIG -----------------------------------------
const STADIUM_PATH = 'cinema.hbs';
//------------------------ !!! CHANGE ONLY THESE VARIABLES !!! ----------------------------------------------------------------------------------------------

let GIF_PLAYING = false
const content = fs.readFileSync("set-up-video/colorMatrices.txt", "utf-8") // Read from the file (synchronous for simplicity)
const rgbCodes = content.match(/0x[0-9a-fA-F]{6}/g) // Extract and clean the RGB color codes in the format 0xRRGGBB

function splitIntoMatrices(data, rows, cols) { // Function to split the RGB codes into multiple matrices
    const matrices = []
    for (let i = 0; i < data.length; i += rows * cols) {
        const matrix = []
        for (let j = 0; j < rows; j++) {
            const start = i + j * cols
            matrix.push(data.slice(start, start + cols))
        }
        matrices.push(matrix)
    }
    return matrices
}

const rows = 19 // Create a 19x13 matrix from the RGB codes
const cols = 13
const matrices = splitIntoMatrices(rgbCodes, rows, cols)

HaxballJS.then((HBInit) => { // Haxball API
    var gameConfig = { // Init config
        roomName: ROOM_NAME,
        // ------ !!! Change this line if you want to change the location of your room !!! -------------------------------------
        // geo: { code: "TR", lat: parseFloat(38.674816), lon: parseFloat(39.222515) },
        // ------ !!! Change this line if you want to change the location of your room !!! -------------------------------------
        maxPlayers: MAX_PLAYER_NUMBER,
        public: IS_PUBLIC,
        noPlayer: true,
        token: HEADLESS_TOKEN,
    }

    const room = HBInit(gameConfig) // Launch room
    room.onRoomLink = function(link) {
        console.log(link) // Print room url
    }

    var stadium = null
    fs.readFile(STADIUM_PATH, 'utf8', (err, data) => { // Load stadium and set room settings
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        stadium = data; // Store the content of the file in the 'stadium' variable
        room.setCustomStadium(stadium)
    });

    room.setTimeLimit(TIME_LIMIT)
    room.setScoreLimit(SCORE_LIMIT)
    room.setTeamsLock(IS_TEAMS_LOCKED)

    async function setDiscColors() {
        if (!GIF_PLAYING) return
        for (const matrix of matrices) {
            if (!GIF_PLAYING) return
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const index = row * cols + col + 1;
                    const color = matrix[row][col];
                    room.setDiscProperties(index, { color });
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }

    function updateAdmins() { // If there are no admins left in the room give admin to one of the remaining players.
        var players = room.getPlayerList() // Get all players
        if (players.length == 0) return // No players left, do nothing.
        if (players.find((player) => player.admin) != null) return // There's an admin left so do nothing.
        room.setPlayerAdmin(players[0].id, true) // Give admin to the first non admin player in the list
    }

    room.onPlayerJoin = function(player) {
        updateAdmins()
    }

    room.onGameStart = function(player) {
        GIF_PLAYING = true
        setDiscColors()
        room.sendAnnouncement(
            "Video started",
            null,
            0x00ff00,
            "italic",
            2
        )
    }

    room.onGameStop = function(player) {
        GIF_PLAYING = false
        room.sendAnnouncement(
            "Video stopped",
            null,
            0x00ff00,
            "italic",
            2
        )
    }

    let nextLogTime = Date.now()
    room.onGameTick = function() {
        const now = Date.now();
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------
        if (now >= nextLogTime) { // Check if it's time to log
            room.sendAnnouncement(
                "For your bot and map requests --> Discord: buggyraz",
                null,
                0xda70d6,
                "bold",
                2
            )
            nextLogTime = now + 5 * 60 * 1000 // Schedule next log (5 minutes later)
        }
        // ------------------ CREATOR LOG -----------------------------------------------------------------------------------
    }
})