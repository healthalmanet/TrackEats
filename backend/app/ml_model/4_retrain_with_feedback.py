import pandas as pd
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from src.dataset import DietDataset
from src.model import Encoder, Decoder, Seq2Seq
from torch.nn.utils.rnn import pad_sequence
import os

# --- This function simulates your app's backend saving approved plans ---
def create_dummy_approved_plans():
    """
    In a real system, your app's backend would create this file
    by saving the nutritionist-approved plans.
    This function creates a dummy version for demonstration.
    """
    print("Creating a dummy 'approved_plans.csv' for demonstration...")
    if not os.path.exists('data/bootstrap_training_data.csv'):
        print("ERROR: 'bootstrap_training_data.csv' not found. Please run '1_prepare_bootstrap_data.py' first.")
        return
        
    bootstrap_data = pd.read_csv('data/bootstrap_training_data.csv').sample(10)
    # In reality, the 'plan_sequence' would be modified by the expert
    bootstrap_data.to_csv('data/approved_plans.csv', index=False)
    print("Dummy data created.")


# --- Hyperparameters (must match initial training) ---
INPUT_DIM = 21
# Load vocab to get its size dynamically
VOCAB_PATH = 'saved_models/food_vocab.json'
if not os.path.exists(VOCAB_PATH):
    raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Please run '1_prepare_bootstrap_data.py' first.")
OUTPUT_DIM = len(json.load(open(VOCAB_PATH)))

ENC_EMB_DIM = 256
DEC_EMB_DIM = 256
HID_DIM = 512
N_EPOCHS = 15 # Fine-tuning usually requires fewer epochs
CLIP = 1
BATCH_SIZE = 8 # Smaller batch size for fine-tuning
LEARNING_RATE = 1e-4 # Lower learning rate
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


def collate_fn(batch):
    user_vectors, plan_sequences = zip(*batch)
    user_vectors = torch.stack(user_vectors)
    plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)
    return user_vectors, plan_sequences_padded


def retrain():
    print(f"Retraining on {DEVICE} using expert-approved data...")
    
    # In a real scenario, this file would be populated by your application
    # We create a dummy one if it doesn't exist
    approved_plans_path = 'data/approved_plans.csv'
    if not os.path.exists(approved_plans_path):
        create_dummy_approved_plans()
        
    dataset = DietDataset(approved_plans_path)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

    # --- Load the PRE-TRAINED V1 model ---
    encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
    decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
    model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)
    
    # Ensure the V1 model exists before trying to load it
    v1_model_path = 'saved_models/diet_model_v1.pth'
    if not os.path.exists(v1_model_path):
        print(f"ERROR: Pre-trained model 'diet_model_v1.pth' not found. Please run '2_train_initial_model.py' first.")
        return
        
    model.load_state_dict(torch.load(v1_model_path, map_location=DEVICE))
    print("Loaded pre-trained V1 model.")

    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    PAD_IDX = 0
    criterion = nn.CrossEntropyLoss(ignore_index=PAD_IDX)

    model.train()
    for epoch in range(N_EPOCHS):
        epoch_loss = 0
        for i, (user_vectors, plan_sequences) in enumerate(dataloader):
            src = user_vectors.to(DEVICE)
            trg = plan_sequences.to(DEVICE)

            optimizer.zero_grad()
            output = model(src, trg, teacher_forcing_ratio=0.7) # Higher teacher forcing for fine-tuning
            
            output_dim = output.shape[-1]
            output = output[1:].view(-1, output_dim)
            trg = trg[1:].view(-1)
            
            loss = criterion(output, trg)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
            optimizer.step()
            epoch_loss += loss.item()
            
        print(f'Fine-Tuning Epoch: {epoch+1:02} | Loss: {epoch_loss/len(dataloader):.3f}')

    # Save the NEW, SMARTER V2 model
    torch.save(model.state_dict(), 'saved_models/diet_model_v2.pth')
    print("Retraining complete. Model saved as 'diet_model_v2.pth'.")

if __name__ == '__main__':
    retrain()