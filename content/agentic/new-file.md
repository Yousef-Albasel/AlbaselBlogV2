---

title: "VLM Fine-tunning"

date: "2026-02-02"

category: "AgenticAI"

description: "VLM Fine Tunning Notes Abu-Bakr Soliman"

---



# VLM Fine-tunning Summary Abu-Bakr Soliman



## Introduction



We need a solution to extract text and data from Arabic documents that are not only limited to normal scanned text but also can include tables, figures and noise.. this makes the extraction process challenging. 



The State of The Art method currently is using VLMs, those are Multi-Modal language models that can understand images. but we have 3 challenges

they need to be



- Local Models

- Low Budget

- Gives More Value Than OCR



## Google Colab Setup 



For each PDF File, we extract all the images in it, save it in a certain format and apply preprocessing steps to each image



The preprocessing steps used are **resize** and **contrast enhancement**

 

## VLM Choices



We have 3 VLM options that we can use

- Qwen3 VL

- Gemma

- Lllava



AbuBakr tried Qwen3 VL 2B parameter and it didn't provide the best performance, so he tried 8B, but after fine-tunning he discovered that Qwen3 Always tends to (Add and Fix) details from the documents. which is not needed in our case. (and some chinese characters are present for some reason)



Abubakr tried Llava Next, he says its faster than qwen but he says it performs poorly with documents that have long content.



Finally, he tried Gemma3, He said it keeps all the details as it, it doesn't Fix or add anything, it only outputs a detail if the confidence is high.





So we are going to use 4b Instruct version for this task.



```py

from transformers import AutoProcessor, Gemma3ForConditionalGeneration

from PIL import Image

import requests

import torch

from IPython.display import Image as diplay

data_dir = "/content/pdf_images"

model_id = "google/gemma-3-4b-it"



model = Gemma3ForConditionalGeneration.from_pretrained(

    model_id, dtype="auto", device_map="auto"

).eval()



processor = AutoProcessor.from_pretrained(model_id)



```



## Why would we extract only text when we can do more



If we are going to use VLM and pay for the extra cost.. why not use it to also categorize, and classify our documents, adding more rich information to the output.



its all about adding more information to the output json, such as publishing dates, document type, date type page number etc..



### Abubakr used a very detailed, long, and rich prompt that contained a lot of information (I’m too lazy to write it all out), but the main purpose was to enrich the output JSON with as much useful information as possible.



For bank invoices example, we could do something like (just an example)

```

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



and add whatever information we want



and here is the full prompt abu-bakr used [https://sharetext.io/r1zwpwpl](https://sharetext.io/r1zwpwpl)



However, Gemma couldn't extract and provide all the data successfully.



Next we are evaluating the cloud version, GEMINI





![image.png](/images/paste-1770601488955-62b9098844fc31ca.png)



This time it performed a lot better, so if we have training data, and these data doesn't have any sensitive information, we can use those, get the good data we get from the cloud API, then use these synthetic data to train the local model. 



## Knowledge Distillation 



A machine learning compression technique that transfers knowledge from a large, complex "teacher" model to a smaller, more efficient "student" model





![image.png](/images/paste-1770601914792-cc826276789d8175.png)





### But what if we don't have this type of data that we can safely send to an external model ?

hummm





## Llama Factory



After completing all calls to the teacher model, we now have, for each image, the data showing how our local VLM should return the output JSON for training. LLaMA Factory is a well-known framework for fine-tuning, and we looked at its template for how fine-tuning data should be formatted. We then matched our data to this format.



In Instruction, you don't have to give the model that entire VERY LONG prompt, in training the model will learn how to output such responses by itself, so you can use less input tokens.



so we only use 2 prompts in this case 



```py

llm_finetunning_data = []



task_1_message = """

You are a professional OCR Details Extractor.

Your rule to extract: the page markdown content in addition to the structural_elements of the document.

Extract the final output into a json format.

Do not generate any introduction or conclusion.

""".strip()



task_2_message = """

You are a professional OCR Details Extractor.

Your rule to extract the: document_classification, source, physical_properties, official_marks, signatures_authorization, routing_distribution, attachments_references, condition_notes and confidence_quality of the document.

Extract the final output into a json format.

Do not generate any introduction or conclusion.

""".strip()



```



We use 2 prompts for 2 separate tasks, one for the content and one for the extra details.



**Important Note:** We usually shuffle our data when we doing our train-test split. Though we shouldn't do image-level split here because if we did split on image-level some data leakage will occur (Training images will appear in validation stage).



So we are going to split on a pdf-level

```py



val_pdf_files = ['0012.pdf', '0005.pdf', '0011.pdf']



train_ds = []

val_ds = []



image_paths_set = set()



```



we Also define a training example for each task, Each dictionary captures:



Conversations between a human and the model (gpt).



Associated images related to the conversation.

and the output that the LLM should reproduce



```py

    task_1_sft_recored = {

        "conversations": [

                {

                    "value": "<image>"+task_1_message, # what the human says, prefixed with "<image>"

                    "from": "human"

                },

                {

                    "value": json.dumps(

                        task_1_output,

                        ensure_ascii=False, default=str

                    ), # model output as JSON string

                    "from": "gpt"

                }

            ],

        "images": [

            rec['image_path']

        ]

    }



    task_2_sft_recored = {

        "conversations": [

                {

                    "value": "<image>"+task_2_message,

                    "from": "human"

                },

                {

                    "value": json.dumps(

                        task_2_output,

                        ensure_ascii=False, default=str

                    ),

                    "from": "gpt"

                }

            ],

        "images": [

            rec['image_path']

        ]

    }



```

 

Next we save our formatted data as json files 

```py

with open(join(data_dir, "datasets", "llamafactory-ocr-finetune-data", "train-v1.json") , "w") as dest:

    json.dump(train_ds, dest, ensure_ascii=False, default=str)



with open(join(data_dir, "datasets", "llamafactory-ocr-finetune-data", "val-v1.json") , "w") as dest:

    json.dump(val_ds, dest, ensure_ascii=False, default=str)

```



LLaMA Factory expect JSON files with structured training and validation data. so we are just serliazing our data to be used in llama factory



### Abu bakr uses vast.ai for fine-tunning, iam poor i will just stick with google colab





We need to install some specific versions of the requirements



```py

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



We also need to add our specific template to Llama Factory's existing templates in `LlamaFactory/data/dataset_info.json`



```

"ocr_finetune_train": {

            "file_name": "/workspace/train-v1-edited.json", # use ur own path here

            "formatting": "sharegpt",

            "columns": {

                "messages": "conversations",

                "images": "images"

            }

    },

    "ocr_finetune_val": {

        "file_name": "/workspace/val-v1-edited.json", # use ur own path here

        "formatting": "sharegpt",

        "columns": {

            "messages": "conversations",

            "images": "images"

        }

    }

 ```





We also need to add a YAML file that has the fine-tunning instructions for train_lora in `workspace/LlamaFactory/examples/train_lora/ocr_finetune.yaml`



```

### model

model_name_or_path: google/gemma-3-4b-it

use_fast_tokenizer: false

cache_dir: /workspace/cache

trust_remote_code: true



### method

stage: sft

do_train: true

finetuning_type: lora

lora_rank: 96

lora_target: all



### dataset

dataset: ocr_finetune_train

eval_dataset: ocr_finetune_val

template: gemma3

cutoff_len: 12000

# max_samples: 50

overwrite_cache: true

preprocessing_num_workers: 16



### output

resume_from_checkpoint: /workspace/ocr-models-gemma-3-4b-it/checkpoint-100

output_dir: /workspace/ocr-models-gemma-3-4b-it/

logging_steps: 25

save_steps: 50

plot_loss: true

# overwrite_output_dir: true



### train

per_device_train_batch_size: 1

gradient_accumulation_steps: 8

learning_rate: 1.0e-4

num_train_epochs: 20.0

lr_scheduler_type: cosine

warmup_ratio: 0.1

bf16: true

ddp_timeout: 180000000



### eval

# val_size: 0.1

per_device_eval_batch_size: 1

eval_strategy: steps

eval_steps: 50



report_to: wandb

run_name: yt-ocr-finetune-llamafactory



# push_to_hub: true

# export_hub_model_id: "bakrianoo/arabic-legal-documents-ocr-parser-1.0"

# hub_private_repo: true

# hub_strategy: checkpoint

```







Finally, we login using wandb and start trainning using our yaml file



`!cd LlamaFactory && export DISABLE_VERSION_CHECK=1 && llamafactory-cli train /workspace/LLaMA-Factory/examples/train_lora/ocr_finetune.yaml`

  `