---
title: "What actually are diffusion"
date: "2026-09-16"
category: ""
description: ""
---

# What actually are diffusion
iffusion in nature is the process in thermodynamics where matter spontaneously moves down a chemical-potential gradient, leading toward a more uniform distribution and an increase in total entropy.

In diffusion models, we create an analogous process artificially: we gradually add random noise to an image until the original structure is completely destroyed.

Because we choose the noise ourselves, we know exactly what noise was added. The model is then trained to predict that noise from the noisy image.

Once trained, we can reverse the process: start with noise and repeatedly remove the noise predicted by the model, eventually producing a new image.

## Why do we need pure noise?

We need pure noise because it gives us a simple starting point for generation.

A real image can be extremely complicated: it contains objects, textures, colors, shapes, and spatial relationships. Instead of asking a model to generate all of that at once, diffusion breaks generation into many small denoising steps.

We gradually transform:

Image → slightly noisy → very noisy → pure noise

Then we learn the reverse:

Pure noise → slightly less noisy → ... → image

Pure noise is useful because it is simple, random, and independent of any particular image. We can easily generate a new random noise pattern whenever we want.

The model therefore learns a general transformation:
**Given a noisy input, predict how to move it toward the distribution of real images.**

So we essentially give the model a standard starting point  to work from.
