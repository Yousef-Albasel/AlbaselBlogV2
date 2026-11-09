---
title: "Attention Alternatives"
date: "2026-09-30"
category: ""
description: "Standard transformer self-attention has a quadratic (O(N²)) computational and memory cost as sequence length grows. Researchers use several alternatives to scale efficiently"
image: "/images/paste-1794169782697-6e2fe6f4a7aa15ed.jpg"
---

# Attention Alternatives

Self attention works by multiplying (QKtranspose).V which finds us what keys are similar to each query that we have then we multiply by V to find the weighted sum of values 

So if we have 1000 token we are dealing with n^2 operations for both Q and K (N*dk).(dk*N)
then we have N*dk so we end up with time complexity of O(n^2.dk)

Linear attention takes advantage of the fact that multiplication is associative so (Q.K).V = Q.(K.V)


![image.png](/images/paste-1794127730770-31dc18d25ee02a5d.png)

This way it is independent of the sequence size and dependent on the embeddings size. (dk*N).(N.dk)

softmax is omitted in this case 

## Recurrent form of linear attention

- qt is Query for current token 
- Kt is it's key
- Vt is it's value

so yt is qt transpose . (sum(ki.vi transpose))

the summation part is just the contributions of all the pervious tokens 
so St = St-1 + ktvtTranspose
and yt = Qt transpose . St

It's just the same idea 

Important tradeoff, the recurrent attention form does not perserve all the information for all the token but uses a compressed form which makes it harder to retrieve data from older tokens 

In linear attention, we maintain:

S_t= sum(k. v transpose)


Each (k.vT) is an outer product between a key and a value.

Think of it as storing an association:
- Key: What kind of information is this?
- Value: What information should be retrieved?
The state accumulates these associations.
2. How does the query retrieve something?
We compute:
yt= qt transpose. St

in normal attentions softmax calculates the individual contribution for each of the values so it might be something like 

0.9 V1 + 0.1 V2

unlike in linear attention each one might have it's independent contribution to the attention equation

5 V1 + 2 V2


![image.png](/images/paste-1794128524971-336bdde8e60dbb82.png)

## Mamba-2

Mamba-2 introduces two important additions:
1. A forget gate gamma_t that controls how much past information survives.
2. A skip connection vt.D that lets the current input contribute directly to the output.

![image.png](/images/paste-1794128777116-3172e2b3a67692a2.png)


Mamba-2 learns when to retain information and when to forget it based on the current token.

It isn't necessarily using the same retention rate every step.


![image.png](/images/paste-1794129005509-b0c94ea2ce20ddfa.png)



So unlike basic linear attention, older tokens are weighted by how much the model has chosen to retain them over time.
Does this solve memory interference?
Not completely.

The forget gate helps by allowing the model to discard old information, making room for newer information in the fixed-size state.

## Gated Delta Net
![image.png](/images/paste-1794129630694-731c5aee0f88d20a.png)


This equation is equal to 

![image.png](/images/paste-1794129754429-8d58b92d333eca57.png)

so we still have retain older information part then calc the correction for the current value "Compare the new target value with what the retained memory would already return for the current key."

then write the new correction 
"Adjust the memory in the current key's direction, controlled by β."


## Sparse Attention

Instead of compressing all previous tokens into one state, it selects a small number of relevant tokens and performs attention only on those.

Suppose we're processing token \(t\), and we have 10,000 previous tokens.

With normal attention, our query would interact with all 10,000 previous keys and values.

With DSA, we first ask:

Which previous tokens are worth paying attention to?

![image.png](/images/paste-1794130512336-469accfa5781c293.png)

So DSA is not equivalent to recurrent linear attention's constant-size memory. Its main advantage is reducing the expensive part of attention, rather than completely eliminating access to individual past token representations.
