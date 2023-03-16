let blockchain = [];

function addBlock(data) {
  const index = blockchain.length;
  const previousHash = index > 0 ? blockchain[index - 1].hash : "0".repeat(64);
  const timestamp = Date.now();
  calculateHash(index, previousHash, timestamp, data).then((hash) => {
    const block = {
      index,
      previousHash,
      timestamp,
      data,
      hash,
    };
    blockchain.push(block);
    saveBlockchain();
    renderBlockchain();
    document.getElementById("validate-button").disabled = false;
  });
}

async function calculateHash(index, previousHash, timestamp, data) {
  const dataToHash = `${index}${previousHash}${timestamp}${data}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function saveBlockchain() {
  localStorage.setItem("blockchain", JSON.stringify(blockchain));
}

function loadBlockchain() {
  const blockchainString = localStorage.getItem("blockchain");
  if (blockchainString) {
    blockchain = JSON.parse(blockchainString);
    renderBlockchain();
    document.getElementById("validate-button").disabled = false;
  }
}

function renderBlockchain() {
  const blockchainDiv = document.getElementById("blockchain");
  blockchainDiv.innerHTML = "";
  blockchain.forEach((block) => {
    const blockDiv = document.createElement("div");
    blockDiv.classList.add("block");
    blockDiv.innerHTML = `
      <div>Index: ${block.index}</div>
      <div>Previous Hash: ${block.previousHash}</div>
      <div>Timestamp: ${block.timestamp}</div>
      <div>Data: ${block.data}</div>
      <div>Hash: ${block.hash}</div>
    `;
    blockchainDiv.appendChild(blockDiv);
  });
}

async function validateBlockchain() {
  const blockchainDiv = document.getElementById("validation");
  blockchainDiv.innerHTML = "";
  let isValid = true;
  let previousHash = "0".repeat(64);
  for (let i = 0; i < blockchain.length; i++) {
    const block = blockchain[i];
    if (block.previousHash !== previousHash) {
      isValid = false;
      break;
    }
    const hash = await calculateHash(
      block.index,
      block.previousHash,
      block.timestamp,
      block.data
    );
    if (block.hash !== hash) {
      isValid = false;
      break;
    }
    previousHash = hash;
  }
  if (isValid) {
    blockchainDiv.style.color = "green";
    blockchainDiv.innerText = "Blockchain is valid!";
  } else {
    blockchainDiv.style.color = "red";
    blockchainDiv.innerText = "Blockchain is not valid!";
  }
}

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = document.getElementById("data").value;
  addBlock(data);
  document.getElementById("data").value = "";
});

document.getElementById("validate-button").addEventListener("click", () => {
  validateBlockchain();
});

loadBlockchain();