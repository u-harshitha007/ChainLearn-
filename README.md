# ChainLearn 
###  Build It. Break It. Understand It.

ChainLearn is an interactive blockchain learning platform designed to help students and developers understand how blockchain systems work through visualization, experimentation, and real-time validation.

Built with FastAPI, React, Three.js, and Tailwind CSS, ChainLearn allows users to create blocks, inspect cryptographic hashes, validate chain integrity, and intentionally tamper with records to observe how blockchain security mechanisms respond.

The platform uses a Cryptographic Vault-inspired interface that transforms blockchain concepts into an immersive learning experience, making topics such as hashing, block linking, validation, and tamper detection easier to understand.

##  Interface Preview (Conceptual Layout)

```
+--------------------------------------------------------------------------------+
|  [SHIELD] ChainLearn   v1.0.0               [ ● Connected to FastAPI Server ]  |
+--------------------------------------------------------------------------------+
|                                                                                |
|                           |
|          Interact with block nodes below. Edit data, witness hashes, break links. |
|                                                                                |
|  +--------------------------------------------------------------------------+  |
|  | [Info] Drag to Rotate • Right-click to Pan • Scroll to Zoom              |  |
|  |                                                                          |  |
|  |   +-------------+        +-------------+        +-------------+          |  |
|  |   | Genesis     | =====> | Block #1    | =====> | Block #2    |          |  |
|  |   | Index: 0    | [Link] | Index: 1    | [Link] | Index: 2    |          |  |
|  |   | Data: Gen   | (Cyan) | Data: Alice | (Cyan) | Data: Bob   |          |  |
|  |   +-------------+        +-------------+        +-------------+          |  |
|  +--------------------------------------------------------------------------+  |
|                                                                                |
|  +-------------------------------------+  +---------------------------------+  |
|  | INTEGRITY DASHBOARD                 |  | SEAL NEW BLOCK                  |  |
|  | Status: [ INTEGRAL ]                |  | Data: [ Alice paid Bob 0.5 BTC ]|  |
|  | Every block hash matches signature. |  | [Presets: Temp sensor / logs]   |  |
|  | [ Run Full Verification Scan ]      |  | [ Assemble & Append Block ]     |  |
|  +-------------------------------------+  +---------------------------------+  |
|                                                                                |
|  +--------------------------------------------------------------------------+  |
|  | Live SHA-256 Hashing Sandbox & Avalanche Effect Demo                      |  |
|  +--------------------------------------------------------------------------+  |
+--------------------------------------------------------------------------------+
```

---

##  Architecture Diagram

ChainLearn splits concerns between a Python ledger validation database and a React Three-dimensional client-side renderer.

```
       +--------------------------------------------+
       |            React (Vite) Frontend           |
       |  - 3D Blockchain Canvas (R3F & Orbit)      |
       |  - Local Cryptographic Sandbox (Web Crypto)|
       |  - Interactive Educational Concept Cards   |
       +--------------------+-----------------------+
                            |
           CORS REST APIs   | (JSON Data Flow)
      (GET /chain, POST /add, GET /validate)
                            |
                            v
       +--------------------+-----------------------+
       |             FastAPI Python Backend         |
       |  - Blockchain Engine (Block & Chain)       |
       |  - Integrity Validation & Tamper Checking  |
       |  - Server-State Storage (In-Memory Ledger) |
       +--------------------------------------------+
```

---

##  Features

- **3D Interactive Blockchain Visualizer**: Pan, rotate, zoom, and interact with glassmorphic 3D blocks.
- **Real-Time Data Tampering Demo**: Modify transactions directly inside a 3D block. Watch the block hash recalculate instantly, triggering downstream chain breakage indicators (links turn red).
- **Server Sync Tampering**: Push tampered blocks to the backend via `POST /tamper` to trigger server-side verification flags.
- **SHA-256 Hashing Sandbox**: Explore how the hashing algorithm works character-by-character.
- **Avalanche Effect Comparison**: Contrast two input strings side-by-side to understand why cryptographic outputs are mathematically unpredictable.
- **Integrity Validation Panel**: A clean dashboard hooked up directly to the backend `GET /validate` scanner.
- **Append Block Panel**: Assemble and add custom transaction payloads. Use preset educational triggers (e.g. registry filings, logs) for fast testing.
- **Interactive Educational Mode**: Concept cards linking directly to the visualizer to explain:
  - *What is a Block?*
  - *What is SHA-256?*
  - *What is Previous Hash?*
  - *What is Blockchain Validation?*

---

## API Endpoints

The backend exposes a lightweight REST API running on port `8000`:

| Method | Endpoint | Description | Sample Request/Response |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Hello greeting and API status | `{"message": "Welcome to ChainLearn"}` |
| **GET** | `/chain` | Fetches the full ledger list of blocks | `[{"index": 0, "timestamp": 1234, "data": "Genesis", ...}]` |
| **GET** | `/validate` | Runs structural validation scans | `{"valid": true}` or `{"valid": false}` |
| **POST** | `/add` | Appends a new block to the chain | Request: `{"data": "Tx Info"}` <br> Response: `{"message": "Block added successfully"}` |
| **POST** | `/tamper` | Mutates backend block data (for teaching) | Request: `{"index": 1, "data": "Tampered data"}` |

---
## Live Demo

Frontend:
https://chain-learn.vercel.app

Backend API:
https://chainlearn-api.onrender.com

API Docs:
https://chainlearn-api.onrender.com/docs

##  Installation & Setup

### Prerequisites
- Node.js (v18.0.0+)
- Python (v3.9.0+)

### 1. Backend Setup
Navigate to the `backend` folder, set up your environment, and launch the server:
```powershell
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
The backend will run at `http://127.0.0.1:8000`.

### 2. Frontend Setup
Open a separate terminal window and launch the React development server:
```powershell
# Navigate to frontend
cd frontend

# Install packages
npm install

# Launch Vite development server
npm run dev
```
The React application will launch at `http://localhost:5173`.

---

##  Learning 

By working with ChainLearn, students will be able to answer:
1. **How does hashing secure a block?** They will witness how a block's index, data, and previous hash form a single immutable signature.
2. **What makes the blockchain chronological?** They will see how the `Previous Hash` field links blocks sequentially, making it mathematically impossible to alter a block without breaking downstream links.
3. **What is validation?** They will understand that nodes verify ledger state by running a simple loop to check hash matches and parent hashes.
4. **Why are hashes unpredictable?** Through the sandbox, they will witness the Avalanche Effect, noting how a one-character edit produces a completely different digital fingerprint.

---

## Future Scope
 

* Proof-of-Work (PoW) Mining Simulator
* Distributed Blockchain Network & Consensus
* Merkle Tree Visualization
* Smart Contract Playground
* Blockchain Attack Simulator
* Persistent Database Storage

