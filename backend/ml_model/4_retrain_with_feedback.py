# === Standard Library Imports ===
import os                         # For file path checks and filesystem operations
import json                       # To load vocabulary JSON
import pandas as pd               # For loading CSV data

# === PyTorch Core Imports ===
import torch                      # PyTorch core framework
import torch.nn as nn             # Neural network modules
import torch.optim as optim       # Optimizers like Adam
from torch.utils.data import DataLoader  # For batch training

# === Custom Modules ===
from src.dataset import DietDataset       # Custom dataset class for diet training
from src.model import Encoder, Decoder, Seq2Seq  # Model components
from torch.nn.utils.rnn import pad_sequence      # For batching variable-length sequences

# === Dummy Data Creator ===
def create_dummy_approved_plans():
    """
    Creates a dummy 'approved_plans.csv' using samples from bootstrap data.
    Simulates real-world scenario where plans are approved by experts via the app.
    """
    print("Creating a dummy 'approved_plans.csv' for demonstration...")

    # Ensure the bootstrap data exists
    if not os.path.exists('data/bootstrap_training_data.csv'):
        print("ERROR: 'bootstrap_training_data.csv' not found. Please run '1_prepare_bootstrap_data.py' first.")
        return

    # Load random sample from bootstrap training data
    bootstrap_data = pd.read_csv('data/bootstrap_training_data.csv').sample(10)

    # Save as approved plan data (in real life, would be hand-edited)
    bootstrap_data.to_csv('data/approved_plans.csv', index=False)
    print("Dummy data created.")

# === Model Hyperparameters ===

INPUT_DIM = 21                      # Number of user features going into the encoder

# Load vocab size from saved JSON
VOCAB_PATH = 'saved_models/food_vocab.json'
if not os.path.exists(VOCAB_PATH):
    raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Please run '1_prepare_bootstrap_data.py' first.")
OUTPUT_DIM = len(json.load(open(VOCAB_PATH)))  # Output vocab size = number of food tokens

# Model architecture settings (same as in initial training)
ENC_EMB_DIM = 256     # Encoder embedding size
DEC_EMB_DIM = 256     # Decoder embedding size
HID_DIM = 512         # Hidden state size

# Training hyperparameters
N_EPOCHS = 15         # Fewer epochs needed during fine-tuning
CLIP = 1              # Gradient clipping value
BATCH_SIZE = 8        # Smaller batch size helps with overfitting
LEARNING_RATE = 1e-4  # Lower learning rate for fine-tuning

# Use GPU if available, otherwise CPU
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


# === Function: Collate padding for batches ===
def collate_fn(batch):
    """
    Pads each plan_sequence in the batch to the same length.
    Used by DataLoader to handle variable-length sequences.
    """
    user_vectors, plan_sequences = zip(*batch)  # Unpack list of tuples
    user_vectors = torch.stack(user_vectors)    # Convert user features to tensor batch
    plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)  # Pad target sequences
    return user_vectors, plan_sequences_padded


# === Fine-Tuning Function ===
def retrain():
    """
    Fine-tunes the initial diet planning model using expert-approved data.
    Saves the updated model as 'diet_model_v2.pth'.
    """
    print(f"Retraining on {DEVICE} using expert-approved data...")

    # --- Ensure approved plans file exists ---
    approved_plans_path = 'data/approved_plans.csv'
    if not os.path.exists(approved_plans_path):
        create_dummy_approved_plans()

    # --- Load dataset ---
    dataset = DietDataset(approved_plans_path)
    dataloader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn  # Custom function to pad sequences
    )

    # --- Load pre-trained model (V1) ---
    encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
    decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
    model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

    # Ensure pre-trained model exists
    v1_model_path = 'saved_models/diet_model_v1.pth'
    if not os.path.exists(v1_model_path):
        print(f"ERROR: Pre-trained model 'diet_model_v1.pth' not found. Please run '2_train_initial_model.py' first.")
        return

    # Load model weights
    model.load_state_dict(torch.load(v1_model_path, map_location=DEVICE))
    print("✅ Loaded pre-trained V1 model.")

    # --- Define optimizer and loss ---
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    PAD_IDX = 0  # Padding token index
    criterion = nn.CrossEntropyLoss(ignore_index=PAD_IDX)  # Ignore PAD during loss calculation

    # --- Training Loop ---
    model.train()  # Set model to training mode
    for epoch in range(N_EPOCHS):
        epoch_loss = 0  # Track total loss for this epoch

        for i, (user_vectors, plan_sequences) in enumerate(dataloader):
            src = user_vectors.to(DEVICE)        # Input: user health features
            trg = plan_sequences.to(DEVICE)      # Target: food token sequences

            optimizer.zero_grad()                # Reset gradients

            # Forward pass with teacher forcing
            output = model(src, trg, teacher_forcing_ratio=0.7)

            # Reshape outputs for loss: (seq_len * batch_size, vocab_size)
            output_dim = output.shape[-1]
            output = output[1:].view(-1, output_dim)  # Remove <sos>, flatten
            trg = trg[1:].view(-1)                    # Remove <sos>, flatten

            # Compute loss
            loss = criterion(output, trg)
            loss.backward()

            # Clip gradients to prevent exploding gradients
            torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
            optimizer.step()

            epoch_loss += loss.item()

        avg_loss = epoch_loss / len(dataloader)
        print(f'📚 Fine-Tuning Epoch: {epoch+1:02} | Loss: {avg_loss:.3f}')

    # --- Save fine-tuned model ---
    torch.save(model.state_dict(), 'saved_models/diet_model_v2.pth')
    print("✅ Retraining complete. Model saved as 'diet_model_v2.pth'.")


# === Run if script is executed directly ===
if __name__ == '__main__':
    retrain()
