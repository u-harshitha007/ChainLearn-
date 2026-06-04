# 1. Import the FastAPI class from the fastapi library.
# FastAPI is the core framework we use to build our web API.
from fastapi import FastAPI

# Import the Blockchain class from blockchain.py.
# Since blockchain.py is in the same directory, we can import it directly.
from blockchain import Blockchain

# 2. Create an instance of the FastAPI class.
# This 'app' object will be the main entry point to configure routes and run our server.
app = FastAPI()

# Create a single global instance of our Blockchain class.
# This will hold the chain list in server memory and automatically create the Genesis Block.
blockchain = Blockchain()

# 3. Define a route for the home page (root directory).
# The '@app.get("/")' decorator tells FastAPI that when a client makes a GET request
# to the root URL ("/"), it should execute the 'read_root' function below.
@app.get("/")
def read_root():
    # 4. Return a dictionary.
    # FastAPI automatically converts Python dictionaries into JSON format before sending them back.
    return {"message": "Welcome to ChainLearn"}


# 5. Define a route to fetch the entire blockchain.
# The '@app.get("/chain")' decorator tells FastAPI to route GET requests for '/chain' here.
@app.get("/chain")
def get_chain():
    """
    Returns the complete list of blocks in the blockchain.
    
    CRITICAL CRYPTOGRAPHIC AND WEB CONCEPTS:
    1. Why FastAPI cannot directly return Python objects:
       FastAPI communicates with web browsers and external clients using HTTP, which transfers 
       raw text. Custom Python objects (like instances of our 'Block' class) are binary data stored 
       in Python's computer memory. Browsers cannot interpret Python's internal memory layout.
       Therefore, the server must serialize (convert) the data into a universal format like JSON.
       
    2. Why we convert blocks into dictionaries:
       A Python dictionary is a built-in data type structured as key-value pairs (e.g., {"index": 0}).
       FastAPI contains built-in tools that know exactly how to translate standard Python dictionaries 
       and lists into standard JSON strings. By converting our list of Block objects into a list of 
       dictionaries, we prepare the data so FastAPI can seamlessly serialize it and send it to the client.
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
