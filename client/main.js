import { DiscordSDK } from "@discord/embedded-app-sdk";
import Wumpus from '/Wumpus.png';
import "./style.css";

// Will eventually store the authenticated user's access_token
let auth;

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

setupDiscordSdk().then(() => {
  console.log("Discord SDK is authenticated");
  // We can now make API calls within the scopes we requested in setupDiscordSDK()
  // Note: the access_token returned is a sensitive secret and should be treated as such
});

async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
    ],
  });

  // Retrieve an access_token from your activity's server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }
}

// Define the options for rock, paper, and scissors
const OPTIONS = ["rock", "paper", "scissors"];

// Function to randomly select an option for the computer
function computerChoice() {
  const randomIndex = Math.floor(Math.random() * OPTIONS.length);
  return OPTIONS[randomIndex];
}

// Function to determine the winner
function determineWinner(userChoice, computerChoice) {
  if (userChoice === computerChoice) {
    return "IT'S A TIE!";
  } else if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    return "YOU WIN!";
  } else {
    return "WUMPUS WIN!";
  }
}

// Update the HTML with the result of the game including both user and computer choices as emojis
function updateResult(userChoice, computerChoice, result) {
  const resultDiv = document.querySelector("#result");
  const userEmoji = getEmoji(userChoice);
  const computerEmoji = getEmoji(computerChoice);
  resultDiv.innerHTML = `
    <p id="emoji">${userEmoji} x ${computerEmoji}</p>
    <p>${result}</p>
  `;
}

// Function to get emoji representation of the choice
function getEmoji(choice) {
  switch (choice) {
    case "rock":
      return "🪨";
    case "paper":
      return "📄";
    case "scissors":
      return "✂️";
    default:
      return "";
  }
}

// Add event listeners to the buttons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#rock").addEventListener("click", () => {
    const userChoice = "rock";
    const computer = computerChoice();
    const result = determineWinner(userChoice, computer);
    updateResult(userChoice, computer, result);
  });

  document.querySelector("#paper").addEventListener("click", () => {
    const userChoice = "paper";
    const computer = computerChoice();
    const result = determineWinner(userChoice, computer);
    updateResult(userChoice, computer, result);
  });

  document.querySelector("#scissors").addEventListener("click", () => {
    const userChoice = "scissors";
    const computer = computerChoice();
    const result = determineWinner(userChoice, computer);
    updateResult(userChoice, computer, result);
  });
});

// Update the HTML to include buttons for rock, paper, and scissors, and a div to display the result
document.querySelector('#app').innerHTML = `
  <div>
    <img src="${Wumpus}" class="logo" alt="Discord" />
    <h1>ROCK x PAPER x SCISSORS</h1>
    <button id="rock">🪨</button>
    <button id="paper">📄</button>
    <button id="scissors">✂️</button>
    <div id="result"></div>
  </div>
`;
