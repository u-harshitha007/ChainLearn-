# 1. Import the FastAPI class from the fastapi library.
# FastAPI is the core framework we use to build our web API.
from fastapi import FastAPI

# 2. Create an instance of the FastAPI class.
# This 'app' object will be the main entry point to configure routes and run our server.
app = FastAPI()

# 3. Define a route for the home page (root directory).
# The '@app.get("/")' decorator tells FastAPI that when a client makes a GET request
# to the root URL ("/"), it should execute the 'read_root' function below.
@app.get("/")
def read_root():
    # 4. Return a dictionary.
    # FastAPI automatically converts Python dictionaries into JSON format before sending them back.
    return {"message": "Welcome to ChainLearn"}


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
