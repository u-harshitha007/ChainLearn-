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


class Blockchain:
    """
    Represents the Blockchain itself.
    
    It manages the chain of blocks, handles block creation, 
    and ensures each block links correctly to its predecessor.
    """
    def __init__(self):
        """
        Initializes a new Blockchain instance.
        
        When a blockchain starts, it is empty, so we must automatically
        generate the very first block (called the Genesis Block) to kickstart the chain.
        """
        # Initialize an empty list that will hold all our blocks.
        self.chain = []
        
        # Automatically generate and append the first block (Genesis Block).
        genesis_block = self.create_genesis_block()
        self.chain.append(genesis_block)

    def create_genesis_block(self):
        """
        Creates and returns the first block of the blockchain (the Genesis Block).
        
        Since this is the first block, it has no predecessor, so we set:
        - index = 0
        - data = "Genesis Block"
        - previous_hash = "0000" (a default dummy hash representing no previous block)
        """
        return Block(
            index=0,
            timestamp=time.time(),
            data="Genesis Block",
            previous_hash="0000"
        )

    def add_block(self, data):
        """
        Creates a new block and appends it to the blockchain.
        
        Parameters:
        - data (str or dict): The transactions or information to store in the new block.
        """
        # 1. Retrieve the latest block currently in the chain.
        latest_block = self.chain[-1]
        
        # 2. Determine the index of the new block (which is simply latest block's index + 1).
        new_index = latest_block.index + 1
        
        # 3. Record the current time for the new block's timestamp.
        new_timestamp = time.time()
        
        # 4. Set the new block's previous_hash to be the cryptographic signature (hash) of the latest block.
        # This is what links the new block to the chain!
        new_previous_hash = latest_block.hash
        
        # 5. Instantiate the new Block. Its constructor automatically calculates its own unique hash.
        new_block = Block(
            index=new_index,
            timestamp=new_timestamp,
            data=data,
            previous_hash=new_previous_hash
        )
        
        # 6. Append the newly created block to our list (chain).
        self.chain.append(new_block)


# Test section to demonstrate how the blockchain connects blocks
if __name__ == '__main__':
    print("=" * 60)
    print("Initializing ChainLearn Blockchain...")
    print("=" * 60)
    
    # 1. Initialize our blockchain. This will automatically create the Genesis Block.
    blockchain = Blockchain()
    
    # 2. Add new blocks containing records of Harshitha's learning journey.
    blockchain.add_block("Harshitha learned Python")
    blockchain.add_block("Harshitha learned FastAPI")
    
    # 3. Print out all the blocks in the chain to visualize the link between them.
    for block in blockchain.chain:
        print(f"Block #{block.index}")
        print(f"  Data:          {block.data}")
        print(f"  Previous Hash: {block.previous_hash}")
        print(f"  Hash:          {block.hash}")
        print("-" * 60)
