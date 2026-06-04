# 1. Import the FastAPI class from the fastapi library.
# FastAPI is the core framework we use to build our web API.
from fastapi import FastAPI

# Import BaseModel from pydantic.
# Pydantic is used by FastAPI for data validation and parsing.
from pydantic import BaseModel

# Import the Blockchain class from blockchain.py.
# Since blockchain.py is in the same directory, we can import it directly.
from blockchain import Blockchain

# 2. Create an instance of the FastAPI class.
# This 'app' object will be the main entry point to configure routes and run our server.
app = FastAPI()

# Create a single global instance of our Blockchain class.
# This will hold the chain list in server memory and automatically create the Genesis Block.
blockchain = Blockchain()

# 3. Create a Pydantic model to define the expected structure of incoming POST data.
#
# CONCEPT: What BaseModel does
# A Pydantic BaseModel defines a schema for the input data. It specifies the fields,
# their data types, and whether they are required. In this case, we require a field
# named 'data' that must be a string. If a client sends data that doesn't match this schema,
# Pydantic automatically catches the error and rejects the request with a helpful error message.
class BlockData(BaseModel):
    data: str


# 4. Define a route for the home page (root directory).
# The '@app.get("/")' decorator tells FastAPI that when a client makes a GET request
# to the root URL ("/"), it should execute the 'read_root' function below.
@app.get("/")
def read_root():
    # Return a dictionary.
    # FastAPI automatically converts Python dictionaries into JSON format before sending them back.
    return {"message": "Welcome to ChainLearn"}


# 5. Define a route to fetch the entire blockchain.
# The '@app.get("/chain")' decorator tells FastAPI to route GET requests for '/chain' here.
@app.get("/chain")
def get_chain():
    """
    Returns the complete list of blocks in the blockchain.
    """
    chain_data = []
    
    # Loop through each custom 'Block' object in our blockchain's chain list.
    for block in blockchain.chain:
        # Convert the object's attributes into a JSON-friendly Python dictionary.
        chain_data.append({
            "index": block.index,
            "timestamp": block.timestamp,
            "data": block.data,
            "previous_hash": block.previous_hash,
            "hash": block.hash
        })
        
    return chain_data


# 6. Define a route to add a new block to the blockchain.
# The '@app.post("/add")' decorator tells FastAPI to route POST requests here.
@app.post("/add")
def add_block(request: BlockData):
    """
    Creates a new block and appends it to the blockchain.
    
    CRITICAL CRYPTOGRAPHIC AND WEB CONCEPTS:
    1. Why POST is used instead of GET:
       GET requests are used solely to fetch or retrieve information from a server. They should not
       modify any state. POST requests are designed to submit data to the server to create or modify
       resources (in this case, appending a new block to our blockchain).
       
    2. How JSON becomes a Python object:
       When a client sends a POST request with a JSON body (e.g., {"data": "..."}), FastAPI reads the 
       raw JSON text stream, parses it, and maps the keys/values onto our 'BlockData' Pydantic model. 
       This results in a clean Python object ('request') where we can access fields using dot notation 
       (e.g., 'request.data').
       
    3. Why FastAPI calls blockchain.add_block():
       To keep the database/blockchain state updated, FastAPI invokes the core domain logic: 
       'blockchain.add_block()'. This method calculates the new block's index, records the current 
       timestamp, retrieves the previous block's hash, and appends the new block securely to our chain.
    """
    blockchain.add_block(request.data)
    return {"message": "Block added successfully"}


# ==============================================================================
# HOW TO RUN THIS APPLICATION:
# ==============================================================================
# 1. Open your terminal/command prompt.
# 2. Make sure you are in the 'backend' directory or navigate to it using:
#    cd backend
# 3. Start the development server using Uvicorn by running:
#    uvicorn main:app --reload
#
# Explanation of the command flags:
# - 'main': refers to the file 'main.py' where the application is written.
# - 'app': refers to the 'app = FastAPI()' instance inside 'main.py'.
# - '--reload': automatically restarts the server whenever code changes are saved.
# ==============================================================================
