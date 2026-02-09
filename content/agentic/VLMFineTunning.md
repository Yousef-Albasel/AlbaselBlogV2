---
title: "VLM Fine-tuning"
date: "2026-02-02"
category: "AgenticAI"
description: "VLM Fine Tuning Notes by Abu-Bakr Soliman"
---

# VLM Fine-tuning Summary by Abu-Bakr Soliman

## Introduction

To effectively extract text and data from Arabic documents, we face challenges that go beyond standard scanned text. These documents often include tables, figures, and noise, complicating the extraction process. 

The current State of the Art employs Vision Language Models (VLMs), which are multi-modal language models capable of understanding images. However, we encounter three primary challenges:

- **Local Models:** The need for models that can run locally.
- **Budget Constraints:** Maintaining a low-cost solution.
- **Value Addition:** The model must provide more value than traditional Optical Character Recognition (OCR) methods.

## Google Colab Setup

For each PDF file, we extract all images, save them in a specified format, and apply preprocessing steps to each image. The preprocessing steps include:

- **Resize**
- **Contrast Enhancement**

## VLM Choices

We have identified three VLM options for our tasks:

- **Qwen3 VL**
- **Gemma**
- **Lllava**

### Qwen3 VL

Abu-Bakr initially tested the Qwen3 VL with 2B parameters, which did not yield satisfactory results. Upon switching to the 8B version, he found that it consistently added and fixed details from the documents an unwanted feature in our case. Additionally, some Chinese characters appeared unexpectedly.

### Lllava

Next, Abu-Bakr experimented with Lllava, noting that while it was faster than Qwen3, it performed poorly with documents containing lengthy content.

### Gemma3

Finally, Abu-Bakr tried Gemma3, which preserved all details without adding or altering them, outputting information only when the confidence level was high. Hence, we will use the 4B Instruct version for our task.

```python
from transformers import AutoProcessor, Gemma3ForConditionalGeneration
from PIL import Image
import requests
import torch
from IPython.display import Image as display

data_dir = "/content/pdf_images"
model_id = "google/gemma-3-4b-it"

model = Gemma3ForConditionalGeneration.from_pretrained(
    model_id, dtype="auto", device_map="auto"
).eval()

processor = AutoProcessor.from_pretrained(model_id)
```

## Expanding Beyond Text Extraction

If we are utilizing a VLM and incurring additional costs, we should leverage its capabilities to categorize and classify our documents, enriching the output with more information. 

This enhancement includes additional metadata in the output JSON, such as:

- Publishing dates
- Document types
- Date types
- Page numbers

### Prompt Example

For example, for bank invoices, the JSON structure could look like this:

```json
{
  "invoice_id": "INV-2026-0023",
  "date": "2026-02-09",
  "due_date": "2026-03-09",
  "sender": {
    "name": "ABC Bank",
    "address": "123 Finance Street, Cairo, Egypt",
    "tax_id": "123456789"
  },
  "recipient": {
    "name": "Youssef Albasel",
    "address": "45 Nile Avenue, Cairo, Egypt",
    "customer_id": "CUST-7890"
  },
  "items": [
    {
      "description": "Monthly account maintenance",
      "quantity": 1,
      "unit_price": 50,
      "currency": "EGP",
      "total": 50
    },
    {
      "description": "International transfer fee",
      "quantity": 2,
      "unit_price": 20,
      "currency": "EGP",
      "total": 40
    }
  ],
  "subtotal": 90,
  "tax": {
    "rate": 14,
    "amount": 12.6
  },
  "total": 102.6,
  "status": "unpaid",
  "notes": "Please pay by the due date to avoid late fees."
}
```

The goal is to enrich the output JSON with as much useful information as possible. For a detailed prompt used by Abu-Bakr, refer to [this link](https://sharetext.io/r1zwpwpl).

Unfortunately, Gemma was unable to extract and provide all the required data successfully.

## Evaluating GEMINI

Next, we evaluated the cloud version, GEMINI, which performed significantly better. If we have training data free of sensitive information, we can utilize it alongside the valuable data obtained from the cloud API to train our local model.

## Knowledge Distillation

Knowledge distillation is a machine learning compression technique that transfers knowledge from a large, complex "teacher" model to a smaller, more efficient "student" model.

### Data Privacy Concerns

If we lack safe data to send to an external model, we might need to invest considerable manual effort in labeling all data.

## Llama Factory

After completing the calls to the teacher model, we now possess the necessary data to format our local VLM's output JSON for training. LLaMA Factory is a well-known framework for fine-tuning, and we followed its template for data formatting.

During training, we only need to use concise prompts rather than lengthy ones, as the model will learn to generate comprehensive responses.

### Training Prompts

We utilize two prompts for two distinct tasks:

```python
llm_finetunning_data = []

task_1_message = """
You are a professional OCR Details Extractor.
Your rule to extract: the page markdown content in addition to the structural elements of the document.
Extract the final output into a JSON format.
Do not generate any introduction or conclusion.
""".strip()

task_2_message = """
You are a professional OCR Details Extractor.
Your rule to extract the: document classification, source, physical properties, official marks, signatures authorization, routing distribution, attachments references, condition notes, and confidence quality of the document.
Extract the final output into a JSON format.
Do not generate any introduction or conclusion.
""".strip()
```

### Data Shuffling Considerations

It is crucial to shuffle our data during the train-test split. However, we should avoid image-level splitting to prevent data leakage, opting instead for PDF-level splitting:

```python
val_pdf_files = ['0012.pdf', '0005.pdf', '0011.pdf']
train_ds = []
val_ds = []
image_paths_set = set()
```

### Training Example Format

We define a training example for each task, capturing conversations between a human and the model (GPT), associated images, and the output that the LLM should reproduce:

```json
task_1_sft_record = {
    "conversations": [
        {
            "value": "<image>" + task_1_message,
            "from": "human"
        },
        {
            "value": json.dumps(task_1_output, ensure_ascii=False, default=str),
            "from": "gpt"
        }
    ],
    "images": [rec['image_path']]
}

task_2_sft_record = {
    "conversations": [
        {
            "value": "<image>" + task_2_message,
            "from": "human"
        },
        {
            "value": json.dumps(task_2_output, ensure_ascii=False, default=str),
            "from": "gpt"
        }
    ],
    "images": [rec['image_path']]
}
```

Next, we save our formatted data as JSON files:

```python
with open(join(data_dir, "datasets", "llamafactory-ocr-finetune-data", "train-v1.json"), "w") as dest:
    json.dump(train_ds, dest, ensure_ascii=False, default=str)

with open(join(data_dir, "datasets", "llamafactory-ocr-finetune-data", "val-v1.json"), "w") as dest:
    json.dump(val_ds, dest, ensure_ascii=False, default=str)
```

LLaMA Factory requires JSON files with structured training and validation data, so we serialize our data accordingly.

### Fine-tuning Setup

Abu-Bakr uses `vast.ai` for fine-tuning, while I will utilize Google Colab due to budget constraints. We need to install specific versions of the required libraries:

```python
!pip install transformers==4.57.6
!pip install optimum==1.26.0
!pip install datasets==4.4.0
!pip install torch==2.8.0
!pip install torchvision==0.23
!pip install torchaudio==2.8.0

!git clone --depth 1 https://github.com/hiyouga/LlamaFactory.git
!cd LlamaFactory && git checkout 762b480131908d37736ad9aa3f12e87f8f7e6313
!cd LlamaFactory && pip install -e .
!cd LlamaFactory && pip install -r requirements/metrics.txt
```

### Template Configuration

We need to add our specific template to Llama Factory's existing templates in `LlamaFactory/data/dataset_info.json`:

```json
"ocr_finetune_train": {
    "file_name": "/workspace/train-v1-edited.json", 
    "formatting": "sharegpt",
    "columns": {
        "messages": "conversations",
        "images": "images"
    }
},
"ocr_finetune_val": {
    "file_name": "/workspace/val-v1-edited.json", 
    "formatting": "sharegpt",
    "columns": {
        "messages": "conversations",
        "images": "images"
    }
}
```

We also need to create a YAML file containing the fine-tuning instructions for `train_lora` in `workspace/LlamaFactory/examples/train_lora/ocr_finetune.yaml`:

```yaml
model:
  model_name_or_path: google/gemma-3-4b-it
  use_fast_tokenizer: false
  cache_dir: /workspace/cache
  trust_remote_code: true

method:
  stage: sft
  do_train: true
  finetuning_type: lora
  lora_rank: 96
  lora_target: all

dataset:
  dataset: ocr_finetune_train
  eval_dataset: ocr_finetune_val
  template: gemma3
  cutoff_len: 12000
  overwrite_cache: true
  preprocessing_num_workers: 16

output:
  resume_from_checkpoint: /workspace/ocr-models-gemma-3-4b-it/checkpoint-100
  output_dir: /workspace/ocr-models-gemma-3-4b-it/
  logging_steps: 25
  save_steps: 50
  plot_loss: true

train:
  per_device_train_batch_size: 1
  gradient_accumulation_steps: 8
  learning_rate: 1.0e-4
  num_train_epochs: 20.0
  lr_scheduler_type: cosine
  warmup_ratio: 0.1
  bf16: true
  ddp_timeout: 180000000

eval:
  per_device_eval_batch_size: 1
  eval_strategy: steps
  eval_steps: 50

report_to: wandb
run_name: yt-ocr-finetune-llamafactory
```

Finally, we log in using Weights and Biases (wandb) and initiate training with our YAML file:

```bash
!cd LlamaFactory && export DISABLE_VERSION_CHECK=1 && llamafactory-cli train /workspace/LLaMA-Factory/examples/train_lora/ocr_finetune.yaml
```