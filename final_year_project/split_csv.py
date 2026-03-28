import pandas as pd
from sklearn.model_selection import train_test_split

# Read the CSV
df = pd.read_csv(r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\labels.csv")

# Split 80% train, 20% validation
train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)

# Save
train_df.to_csv(r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\labels_train.csv", index=False)
val_df.to_csv(r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\labels_val.csv", index=False)

print("Train CSV rows:", len(train_df))
print("Validation CSV rows:", len(val_df))
