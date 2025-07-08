# # import torch
# # import torch.nn as nn
# # import torch.optim as optim
# # from torch.utils.data import DataLoader
# # from src.dataset import DietDataset
# # from src.model import Encoder, Decoder, Seq2Seq
# # import json
# # from torch.nn.utils.rnn import pad_sequence
# # import os

# # # --- Paths ---
# # SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# # VOCAB_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
# # MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'diet_model_v1.pth')
# # TRAINING_DATA_PATH = os.path.join(SCRIPT_DIR, 'data', '1_bootstrap_training_data.csv')

# # # --- Hyperparameters ---
# # INPUT_DIM = 21  # Number of user profile numerical features
# # ENC_EMB_DIM = 256
# # DEC_EMB_DIM = 256
# # HID_DIM = 512
# # N_EPOCHS = 20
# # CLIP = 1
# # BATCH_SIZE = 32
# # DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# # # --- Load vocab ---
# # if not os.path.exists(VOCAB_PATH):
# #     raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Run '1_prepare_bootstrap_data.py' first.")

# # with open(VOCAB_PATH, 'r') as f:
# #     vocab = json.load(f)
# # OUTPUT_DIM = len(vocab)

# # def collate_fn(batch):
# #     user_vectors, plan_sequences = zip(*batch)
# #     user_vectors = torch.stack(user_vectors)
# #     plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)
# #     return user_vectors, plan_sequences_padded

# # def train():
# #     print(f"Training on {DEVICE}...")

# #     dataset = DietDataset(TRAINING_DATA_PATH)
# #     dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

# #     encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
# #     decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
# #     model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

# #     optimizer = optim.Adam(model.parameters())
# #     criterion = nn.CrossEntropyLoss(ignore_index=0)

# #     model.train()

# #     for epoch in range(N_EPOCHS):
# #         epoch_loss = 0

# #         for i, (user_vectors, plan_sequences) in enumerate(dataloader):
# #             src = user_vectors.to(DEVICE)
# #             trg = plan_sequences.to(DEVICE)

# #             optimizer.zero_grad()
# #             output = model(src, trg)

# #             output_dim = output.shape[-1]
# #             output = output[1:].view(-1, output_dim)
# #             trg = trg[1:].view(-1)

# #             loss = criterion(output, trg)
# #             loss.backward()

# #             torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
# #             optimizer.step()

# #             epoch_loss += loss.item()

# #         print(f'Epoch: {epoch+1:02} | Loss: {epoch_loss / len(dataloader):.3f}')

# #     os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
# #     torch.save(model.state_dict(), MODEL_SAVE_PATH)
# #     print(f"Initial model (V1) trained and saved to {MODEL_SAVE_PATH}")

# # if __name__ == '__main__':
# #     train()


# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader
# from src.dataset import DietDataset
# from src.model import Encoder, Decoder, Seq2Seq
# import json
# from torch.nn.utils.rnn import pad_sequence
# import os

# # --- Paths ---
# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# VOCAB_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
# MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'diet_model_v1.pth')
# TRAINING_DATA_PATH = os.path.join(SCRIPT_DIR, 'data', '1_bootstrap_training_data.csv')

# # --- Hyperparameters ---
# INPUT_DIM = 21
# ENC_EMB_DIM = 256
# DEC_EMB_DIM = 256
# HID_DIM = 512
# N_EPOCHS = 5   # Reduce for faster testing
# CLIP = 1
# BATCH_SIZE = 16
# DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# # --- Load vocab ---
# if not os.path.exists(VOCAB_PATH):
#     raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Run '1_prepare_bootstrap_data.py' first.")

# with open(VOCAB_PATH, 'r') as f:
#     vocab = json.load(f)
# OUTPUT_DIM = len(vocab)

# # --- Collate function ---
# def collate_fn(batch):
#     user_vectors, plan_sequences = zip(*batch)
#     user_vectors = torch.stack(user_vectors)
#     plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)
#     return user_vectors, plan_sequences_padded

# # --- Training function ---
# def train():
#     print(f"Training on {DEVICE}...")

#     dataset = DietDataset(TRAINING_DATA_PATH)
#     dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

#     encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
#     decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
#     model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

#     optimizer = optim.Adam(model.parameters())
#     criterion = nn.CrossEntropyLoss(ignore_index=0)

#     model.train()

#     for epoch in range(N_EPOCHS):
#         epoch_loss = 0

#         for i, (user_vectors, plan_sequences) in enumerate(dataloader):
#             src = user_vectors.to(DEVICE)
#             trg = plan_sequences.to(DEVICE)

#             optimizer.zero_grad()
#             output = model(src, trg)

#             output_dim = output.shape[-1]
#             output = output[1:].reshape(-1, output_dim)
#             trg = trg[1:].reshape(-1)

#             loss = criterion(output, trg)
#             loss.backward()
#             torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
#             optimizer.step()

#             epoch_loss += loss.item()

#         print(f'Epoch: {epoch+1:02} | Avg Loss: {epoch_loss / len(dataloader):.4f}')

#     os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
#     torch.save(model.state_dict(), MODEL_SAVE_PATH)
#     print(f"\n✅ Initial model (V1) trained and saved to {MODEL_SAVE_PATH}")

# # --- Run ---
# if __name__ == '__main__':
#     train()



# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader
# from src.dataset import DietDataset
# from src.model import Encoder, Decoder, Seq2Seq
# import json
# from torch.nn.utils.rnn import pad_sequence
# import os

# # --- Paths ---
# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# VOCAB_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
# MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'diet_model_v1.pth')
# TRAINING_DATA_PATH = os.path.join(SCRIPT_DIR, 'data', '1_bootstrap_training_data.csv')

# # --- Hyperparameters ---
# INPUT_DIM = 21  # Number of user profile numerical features
# ENC_EMB_DIM = 256
# DEC_EMB_DIM = 256
# HID_DIM = 512
# N_EPOCHS = 20
# CLIP = 1
# BATCH_SIZE = 32
# DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# # --- Load vocab ---
# if not os.path.exists(VOCAB_PATH):
#     raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Run '1_prepare_bootstrap_data.py' first.")

# with open(VOCAB_PATH, 'r') as f:
#     vocab = json.load(f)
# OUTPUT_DIM = len(vocab)

# def collate_fn(batch):
#     user_vectors, plan_sequences = zip(*batch)
#     user_vectors = torch.stack(user_vectors)
#     plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)
#     return user_vectors, plan_sequences_padded

# def train():
#     print(f"Training on {DEVICE}...")

#     dataset = DietDataset(TRAINING_DATA_PATH)
#     dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

#     encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
#     decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
#     model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

#     optimizer = optim.Adam(model.parameters())
#     criterion = nn.CrossEntropyLoss(ignore_index=0)

#     model.train()

#     for epoch in range(N_EPOCHS):
#         epoch_loss = 0

#         for i, (user_vectors, plan_sequences) in enumerate(dataloader):
#             src = user_vectors.to(DEVICE)
#             trg = plan_sequences.to(DEVICE)

#             optimizer.zero_grad()
#             output = model(src, trg)

#             output_dim = output.shape[-1]
#             output = output[1:].view(-1, output_dim)
#             trg = trg[1:].view(-1)

#             loss = criterion(output, trg)
#             loss.backward()

#             torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
#             optimizer.step()

#             epoch_loss += loss.item()

#         print(f'Epoch: {epoch+1:02} | Loss: {epoch_loss / len(dataloader):.3f}')

#     os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
#     torch.save(model.state_dict(), MODEL_SAVE_PATH)
#     print(f"Initial model (V1) trained and saved to {MODEL_SAVE_PATH}")

# if __name__ == '__main__':
#     train()


# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader
# from src.dataset import DietDataset
# from src.model import Encoder, Decoder, Seq2Seq
# import json
# from torch.nn.utils.rnn import pad_sequence
# import os

# # --- Paths ---
# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# VOCAB_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
# MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'diet_model_v1.pth')
# TRAINING_DATA_PATH = os.path.join(SCRIPT_DIR, 'data', '1_bootstrap_training_data.csv')

# # --- Hyperparameters ---
# INPUT_DIM = 21
# ENC_EMB_DIM = 256
# DEC_EMB_DIM = 256
# HID_DIM = 512
# N_EPOCHS = 5   # Reduce for faster testing
# CLIP = 1
# BATCH_SIZE = 16
# DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# # --- Load vocab ---
# if not os.path.exists(VOCAB_PATH):
#     raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Run '1_prepare_bootstrap_data.py' first.")

# with open(VOCAB_PATH, 'r') as f:
#     vocab = json.load(f)
# OUTPUT_DIM = len(vocab)

# # --- Collate function ---
# def collate_fn(batch):
#     user_vectors, plan_sequences = zip(*batch)
#     user_vectors = torch.stack(user_vectors)
#     plan_sequences_padded = pad_sequence(plan_sequences, batch_first=False, padding_value=0)
#     return user_vectors, plan_sequences_padded

# # --- Training function ---
# def train():
#     print(f"Training on {DEVICE}...")

#     dataset = DietDataset(TRAINING_DATA_PATH)
#     dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

#     encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
#     decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
#     model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

#     optimizer = optim.Adam(model.parameters())
#     criterion = nn.CrossEntropyLoss(ignore_index=0)

#     model.train()

#     for epoch in range(N_EPOCHS):
#         epoch_loss = 0

#         for i, (user_vectors, plan_sequences) in enumerate(dataloader):
#             src = user_vectors.to(DEVICE)
#             trg = plan_sequences.to(DEVICE)

#             optimizer.zero_grad()
#             output = model(src, trg)

#             output_dim = output.shape[-1]
#             output = output[1:].reshape(-1, output_dim)
#             trg = trg[1:].reshape(-1)

#             loss = criterion(output, trg)
#             loss.backward()
#             torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
#             optimizer.step()

#             epoch_loss += loss.item()

#         print(f'Epoch: {epoch+1:02} | Avg Loss: {epoch_loss / len(dataloader):.4f}')

#     os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
#     torch.save(model.state_dict(), MODEL_SAVE_PATH)
#     print(f"\n✅ Initial model (V1) trained and saved to {MODEL_SAVE_PATH}")

# # --- Run ---
# if __name__ == '__main__':
#     train()



import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.nn.utils.rnn import pad_sequence
from src.dataset import DietDataset
from src.model import Encoder, Decoder, Seq2Seq
import json
import os
import time

# Disable CUDNN for safety on CPU
torch.backends.cudnn.enabled = False

# --- Paths ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VOCAB_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, 'saved_models', 'diet_model_v1.pth')
TRAINING_DATA_PATH = os.path.join(SCRIPT_DIR, 'data', '1_bootstrap_training_data.csv')

# ✅ Ensure save directory exists early
os.makedirs(os.path.join(SCRIPT_DIR, 'saved_models'), exist_ok=True)

# --- Hyperparameters ---
INPUT_DIM = 21
ENC_EMB_DIM = 256
DEC_EMB_DIM = 256
HID_DIM = 512
N_EPOCHS = 50  # Change to 20 for full training
CLIP = 1
BATCH_SIZE = 16
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# --- Load vocab ---
if not os.path.exists(VOCAB_PATH):
    raise FileNotFoundError(f"Vocabulary file not found at {VOCAB_PATH}. Run '1_prepare_bootstrap_data.py' first.")

with open(VOCAB_PATH, 'r') as f:
    vocab = json.load(f)

OUTPUT_DIM = len(vocab)

# --- Collate function ---
def collate_fn(batch):
    user_vectors, plan_sequences = zip(*batch)
    user_vectors = torch.stack(user_vectors)
    plan_sequences_padded = pad_sequence(list(plan_sequences), batch_first=False, padding_value=0)
    return user_vectors, plan_sequences_padded

# --- Training function ---
def train(resume_from_last=True):
    print(f"\n🚀 Training on: {DEVICE}")

    dataset = DietDataset(TRAINING_DATA_PATH)

    dataloader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=0  # Prevent memory crash on CPU
    )

    encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
    decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
    model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss(ignore_index=0)

    start_epoch = 0

    # Resume from saved checkpoint
    if resume_from_last and os.path.exists(MODEL_SAVE_PATH):
        print("🔁 Found saved model. Resuming training...")
        checkpoint = torch.load(MODEL_SAVE_PATH)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        start_epoch = checkpoint['epoch'] + 1
    else:
        print("🆕 Starting new training...")

    model.train()

    try:
        for epoch in range(start_epoch, N_EPOCHS):
            start_time = time.time()
            epoch_loss = 0

            for i, (user_vectors, plan_sequences) in enumerate(dataloader):
                src = user_vectors.to(DEVICE).float()
                trg = plan_sequences.to(DEVICE)

                optimizer.zero_grad()
                output = model(src, trg)

                output_dim = output.shape[-1]
                output = output[1:].reshape(-1, output_dim)
                trg = trg[1:].reshape(-1)

                loss = criterion(output, trg)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), CLIP)
                optimizer.step()

                epoch_loss += loss.item()

            avg_loss = epoch_loss / len(dataloader)
            elapsed = time.time() - start_time

            print(f"📊 Epoch: {epoch+1:02} | Avg Loss: {avg_loss:.4f} | Time: {elapsed:.2f}s")

            # 💾 Save current model
            print(f"💾 Saving model to: {MODEL_SAVE_PATH}")
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
            }, MODEL_SAVE_PATH)

            # Optional: also save versioned model
            versioned_path = MODEL_SAVE_PATH.replace(".pth", f"_epoch_{epoch+1:02}.pth")
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
            }, versioned_path)

    except Exception as e:
        print(f"\n💥 Training crashed: {e}")
        print(f"💾 Saving emergency backup to: {MODEL_SAVE_PATH}")
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
        }, MODEL_SAVE_PATH)

    print(f"\n✅ Training complete. Final model saved to: {MODEL_SAVE_PATH}")

# --- Run ---
if __name__ == '__main__':
    train()
