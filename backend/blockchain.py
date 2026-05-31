import hashlib
import time

class Block:
    """
    Represents a single block in a blockchain.
    
    Think of a block as a page in a ledger. It contains records (data), 
    metadata (like when it was created), and a unique link to the previous page.
    """
    def __init__(self, index, timestamp, data, previous_hash):
        """
        Initializes a new Block.
        
        Parameters:
        - index (int): The position of this block in the chain (e.g., 0 for the first/Genesis block, 1, 2, etc.).
        - timestamp (float/int): The exact time when this block was created (typically a Unix timestamp).
        - data (str or dict): The actual information or transaction records stored in this block.
        - previous_hash (str): The unique cryptographic signature (hash) of the block that came before this one.
        """
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        
        # The hash is automatically generated upon block creation to ensure the block is sealed 
        # with its unique cryptographic fingerprint right away.
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        """
        Calculates a unique cryptographic SHA-256 hash for this block based on its contents.
        
        By hashing the combination of the index, timestamp, data, and the previous block's hash,
        we create a digital fingerprint that represents the exact state of this block.
        """
        # 1. Combine all the block's details into a single string.
        # Converting everything to strings allows us to concatenate them seamlessly.
        block_content_string = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}"
        
        # 2. Encode the string into bytes.
        # The SHA-256 cryptographic algorithm requires raw bytes as input, not plain text.
        block_bytes = block_content_string.encode('utf-8')
        
        # 3. Compute the SHA-256 hash.
        # hashlib.sha256() hashes the bytes, and .hexdigest() converts the binary result into a 
        # readable 64-character hexadecimal string (using characters 0-9 and a-f).
        return hashlib.sha256(block_bytes).hexdigest()
