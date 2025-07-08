# import pandas as pd
# import torch
# from torch.utils.data import Dataset
# import json

# class DietDataset(Dataset):
#     def __init__(self, csv_path):
#         df = pd.read_csv(csv_path)
#         # Convert string representations of lists back to Python lists
#         df['user_vector'] = df['user_vector'].apply(lambda x: json.loads(x))
#         df['plan_sequence'] = df['plan_sequence'].apply(lambda x: json.loads(x))
        
#         self.user_vectors = torch.tensor([item for item in df['user_vector']], dtype=torch.float32)
        
#         # Add <sos> and <eos> tokens
#         sos_token = 1
#         eos_token = 2
#         self.plan_sequences = [torch.tensor([sos_token] + item + [eos_token], dtype=torch.long) for item in df['plan_sequence']]
        
#     def __len__(self):
#         return len(self.user_vectors)
    
#     def __getitem__(self, idx):
#         return self.user_vectors[idx], self.plan_sequences[idx]


import pandas as pd
import torch
from torch.utils.data import Dataset
import json

def is_valid_json(s):
    try:
        return isinstance(json.loads(s), list)
    except:
        return False

class DietDataset(Dataset):
    def __init__(self, csv_path):
        df = pd.read_csv(csv_path)

        # Drop NaNs
        df = df.dropna(subset=['user_vector', 'plan_sequence'])

        # Drop rows with invalid JSON
        df = df[df['user_vector'].apply(is_valid_json)]
        df = df[df['plan_sequence'].apply(is_valid_json)]

        # Convert string to list
        df['user_vector'] = df['user_vector'].apply(json.loads)
        df['plan_sequence'] = df['plan_sequence'].apply(json.loads)

        # Convert to tensors
        self.user_vectors = torch.tensor(df['user_vector'].tolist(), dtype=torch.float32)

        # Add <sos> and <eos> tokens
        sos_token = 1
        eos_token = 2
        self.plan_sequences = [
            torch.tensor([sos_token] + seq + [eos_token], dtype=torch.long)
            for seq in df['plan_sequence']
        ]

    def __len__(self):
        return len(self.user_vectors)

    def __getitem__(self, idx):
        return self.user_vectors[idx], self.plan_sequences[idx]