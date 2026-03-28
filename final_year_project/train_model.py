from palette_pipeline import train_loop

if __name__ == "__main__":
    import os
    os.environ["OMP_NUM_THREADS"] = "1"  # optional, avoids some multithreading issues
    train_csv = "labels_train.csv"
    val_csv = "labels_val.csv"
    K = 5
    epochs = 10
    batch_size = 16
    lr = 1e-4
    device = "cpu"  # or "cuda" if you have GPU

    train_loop(train_csv, val_csv, K=K, epochs=epochs, batch_size=batch_size, lr=lr, device=device)
