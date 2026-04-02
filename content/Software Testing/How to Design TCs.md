---
title: "How to Design TCs"
date: "2026-04-02"
category: ""
description: ""
---

# How to Design TCs

## Step 1 : Identify testable functions

- Individual methods have one Testable function

- Methods in a class often have the same characteristics

- Programs have more complicated characteristics—

modeling documents such as UML can be used to design
characteristics

- Systems of integrated hardware and software components
can use devices, operating systems, hardware platforms,
browsers, etc.


## Step 2 : Find all the parameters
- Often fairly straightforward, even mechanical
- Important to be complete
- Methods : Parameters and state (non-local) variables
used
- Components : Parameters to methods and state
variables
- System : All inputs, including files and databases


## Step 3 : Model the input domain
- The domain is scoped by the parameters
- The structure is defined in terms of characteristics
- Each characteristic is partitioned into sets of blocks
- Each block represents a set of values
- This is the most creative design step in using ISP

Introduction to Software Testing, Edition 2 (Ch 6)
Step 4 : Apply a test criterion to choose combinations of
values
- A test input has a value for each parameter
- One block for each characteristic
- Choosing all combinations is usually infeasible
- Coverage criteria allow subsets to be chosen

## Step 5 : Refine combinations of blocks into test inputs
- Choose appropriate values from each block

## Functionality-Based Approach

- Identify characteristics that correspond to the intended
functionality
- Requires more design effort from tester
- Can incorporate domain and semantic knowledge
- Can use relationships among parameters
- Modeling can be based on requirements, not
implementation
- The same parameter may appear in multiple
characteristics, so it’s harder to translate values to test
cases