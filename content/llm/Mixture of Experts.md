---
title: "Mixture of Experts"
date: "2026-11-08"
category: ""
description: "A machine learning architecture that scales model capacity by dividing a neural network into specialized sub-networks called experts, using a gating network (router) to activate only a subset of them for each input"
image: "/images/paste-1794141753205-357f56dce6a22da4.png"
---

# Mixture of Experts



The main idea, instead of a big FFN we divide it into multiple small expert networks and route the input to one of them 
![image.png](/images/paste-1794134395010-41fd35135375635c.png)

![image.png](/images/paste-1794134197621-addc662d1ec00b05.png)

Once you pick the experts you combine their outputs using 

![image.png](/images/paste-1794134235874-73b71abcc3f6fead.png)

where G(xi) is the score the router gave that expert so an expert output could be 0.6 and another is 0.4, so each expert contributes a little to the output all experts are trained, so that's why the total parameters are big because all experts exist and all of them are being trained but in inference only a subset of them are used


![image.png](/images/paste-1794140189195-09afcc9602b2728f.png)


![image.png](/images/paste-1794140202035-ddd0b5a9ecb86f19.png)

Code:
```py
import torch.nn.functional as F

class DenseBlock(nn.Module):
    def __init__(self, input_size, output_size, dropout_rate):
        super(DenseBlock, self).__init__()
        self.linear = nn.Linear(input_size, output_size)
        self.batch_norm = nn.BatchNorm1d(output_size)
        self.activation = nn.ReLU()
        self.dropout = nn.Dropout(dropout_rate)

    def forward(self, x):
        x = self.linear(x)
        x = self.batch_norm(x)
        x = self.activation(x)
        x = self.dropout(x)
        return x

class FeedForwardExpert(nn.Module):
    def __init__(self, output_size, dropout_rate):
        super(FeedForwardExpert, self).__init__()
        self.output_size = output_size

        # Define the dense blocks
        self.block1 = DenseBlock(768, 400, dropout_rate)
        self.block2 = DenseBlock(400, 200, dropout_rate)
        self.final_layer = nn.Linear(200, self.output_size)

        self.initialize_weights()

    def forward(self, x):
        x = self.block1(x)  # Bx768 -> Bx400
        x = self.block2(x)  # Bx400 -> Bx50
        x = self.final_layer(x)  # Bx50 -> Bx6
        return x
```

```py
class Router(nn.Module):
    def __init__(self, num_experts):
        super().__init__()
        self.num_experts = num_experts
        self.fc1 = nn.Linear(768, 128)
        self.fc2 = nn.Linear(128, self.num_experts)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        return F.softmax(self.fc2(x), dim=-1)
```

```py
class MoE(nn.Module):
    def __init__(self, num_experts, output_size=70, dropout_rate=0.11, top_k=2):
        super().__init__()
        self.num_experts = num_experts
        self.dropout_rate = dropout_rate
        self.k = top_k
        self.output_size = output_size
        self.experts = nn.ModuleList([FeedForwardExpert(self.output_size, self.dropout_rate) for _ in range(num_experts)])
        self.router = Router(self.num_experts)

    def forward(self, x):
        # Get routing weights and find the top-k experts
        routing_weights = self.router(x)
        topk_vals, topk_indices = torch.topk(routing_weights, self.k, dim=1)
        topk_vals_normalized = topk_vals / topk_vals.sum(dim=1, keepdim=True) # Normalize top-k values

        # Initialize an output tensor with zeros
        outputs = torch.zeros(x.size(0), self.output_size, device=x.device) # Shape (bs, c)

        # Iterate through the experts
        for expert_index in range(len(self.experts)):
        # Check if the expert is in the top-k indices
            expert_mask = (topk_indices == expert_index)
            if expert_mask.any(): # If this expert is selected in any of the top-k

                expert_weight = (topk_vals_normalized * expert_mask).sum(dim=1).view(-1,1) # (bs, 1)
                # Get output from the expert
                expert_output = self.experts[expert_index](x) # Shape (bs, c)

                # Multiply the output by the corresponding weights and sum up
                outputs += (expert_output * expert_weight) # Shape (bs, c)
        return outputs
```

