import os
import json
import torch
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
from datasets import Dataset, DatasetDict
from transformers import (AutoTokenizer, AutoModelForSequenceClassification,
                          TrainingArguments, Trainer, DataCollatorWithPadding,
                          EarlyStoppingCallback)
import evaluate

# -------- CONFIG --------
model_name = "mental/mental-bert-base-uncased"  # mental health domain model
out_dir = "./hf_out"
max_len = 256
bs = 16
epochs = 5
lr = 2e-5
seed = 42
# ------------------------

# ---- 1) Load + combine CSVs ----
files = [
    "data path/reddit-mental-health-dataset/Original Reddit Data/Labelled Data/LD DA 1.csv",
    "data path/reddit-mental-health-dataset/Original Reddit Data/Labelled Data/LD EL1.csv",
    "data path/reddit-mental-health-dataset/Original Reddit Data/Labelled Data/LD PF1.csv",
    "data path/reddit-mental-health-dataset/Original Reddit Data/Labelled Data/LD TS 1.csv"
]
dfs = [pd.read_csv(p) for p in files]
df = pd.concat(dfs, ignore_index=True)

# Basic cleaning
df = df.dropna(subset=['subreddit','selftext','title'])
df['text'] = df['selftext'].fillna('') + ' ' + df['title'].fillna('')
df = df[df['text'].str.len() > 20].reset_index(drop=True)

# ---- 2) Labels ----
le = LabelEncoder()
df['label'] = le.fit_transform(df['subreddit'])
num_labels = len(le.classes_)
print("num labels:", num_labels)
print("classes:", list(le.classes_))

# ---- 3) Train/val/test split ----
tr_df, te_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=seed)
tr_df, val_df = train_test_split(tr_df, test_size=0.1, stratify=tr_df['label'], random_state=seed)

# ---- 4) HF datasets ----
ds_tr = Dataset.from_pandas(tr_df[['text','label']])
ds_val = Dataset.from_pandas(val_df[['text','label']])
ds_te = Dataset.from_pandas(te_df[['text','label']])
ds = DatasetDict({"train": ds_tr, "val": ds_val, "test": ds_te})

# ---- 5) Tokenizer ----
tok = AutoTokenizer.from_pretrained(model_name, use_fast=True)

def tok_fn(batch):
    return tok(batch["text"], truncation=True, padding=False, max_length=max_len)

ds = ds.map(tok_fn, batched=True, remove_columns=["text"])
data_coll = DataCollatorWithPadding(tokenizer=tok)

# ---- 6) Compute class weights ----
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(tr_df['label']),
    y=tr_df['label']
)
class_weights = torch.tensor(class_weights, dtype=torch.float).to("cuda")

# ---- 7) Load model ----
mdl = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)

# Override Trainer to use weighted loss
from torch.nn import CrossEntropyLoss
from transformers import Trainer

class WeightedTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        loss_fct = CrossEntropyLoss(weight=class_weights)
        loss = loss_fct(logits, labels)
        return (loss, outputs) if return_outputs else loss

# ---- 8) Metrics ----
acc = evaluate.load("accuracy")
f1 = evaluate.load("f1")
prec = evaluate.load("precision")
rec = evaluate.load("recall")

def compute_metrics(pred):
    logits = pred.predictions
    preds = np.argmax(logits, axis=-1)
    lab = pred.label_ids
    return {
        "accuracy": acc.compute(predictions=preds, references=lab)["accuracy"],
        "f1_macro": f1.compute(predictions=preds, references=lab, average="macro")["f1"],
        "precision_macro": prec.compute(predictions=preds, references=lab, average="macro")["precision"],
        "recall_macro": rec.compute(predictions=preds, references=lab, average="macro")["recall"]
    }

# ---- 9) Training arguments ----
tr_args = TrainingArguments(
    output_dir=out_dir,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=lr,
    per_device_train_batch_size=bs,
    per_device_eval_batch_size=bs,
    num_train_epochs=epochs,
    weight_decay=0.01,
    logging_steps=50,
    logging_dir=f"{out_dir}/logs",
    report_to="none",
    load_best_model_at_end=True,
    metric_for_best_model="f1_macro",
    greater_is_better=True,
    save_total_limit=2,
    seed=seed,
    fp16=True,
    disable_tqdm=False,
)

# ---- 10) Trainer ----
trainer = WeightedTrainer(
    model=mdl,
    args=tr_args,
    train_dataset=ds["train"],
    eval_dataset=ds["val"],
    tokenizer=tok,
    data_collator=data_coll,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=5)]
)

# ---- 11) Train ----
print("Starting training...")
print(f"Training samples: {len(ds['train'])}")
print(f"Validation samples: {len(ds['val'])}")
print(f"Device: {trainer.args.device}")
trainer.train()
print("Training completed!")

# ---- 12) Evaluate ----
print("Validation results:", trainer.evaluate(ds["val"]))
print("Test results:", trainer.evaluate(ds["test"]))

# ---- 13) Predictions ----
preds = trainer.predict(ds["test"])
y_pred = np.argmax(preds.predictions, axis=-1)
y_true = preds.label_ids

from sklearn.metrics import classification_report, accuracy_score
print("Acc:", accuracy_score(y_true, y_pred))
print(classification_report(y_true, y_pred, target_names=list(le.classes_)))

# ---- 14) Save model + tokenizer + labels ----
trainer.save_model(out_dir)
tok.save_pretrained(out_dir)
with open(os.path.join(out_dir, "labels.json"), "w") as f:
    json.dump({"classes": list(le.classes_)}, f)
print("Saved to", out_dir)