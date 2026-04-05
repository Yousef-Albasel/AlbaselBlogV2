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


![image.png](/images/paste-1775165787288-eccde9aac32ec303.png)
## All Combinations Approach


Suppose you have three variables for a function:
```
def my_function(x, y, z):
    print(f"x={x}, y={y}, z={z}")
    # Imagine some logic here
```
Your variables can take these values:
```
x_values = ["x1", "x2"]
y_values = ["y1", "y2"]
z_values = ["z1", "z2"]
```

You want every possible combination:
```
for x in x_values:
    for y in y_values:
        for z in z_values:
            my_function(x, y, z)

```

Output (all 8 tests):
```
x=x1, y=y1, z=z1
x=x1, y=y1, z=z2
x=x1, y=y2, z=z1
x=x1, y=y2, z=z2
x=x2, y=y1, z=z1
x=x2, y=y1, z=z2
x=x2, y=y2, z=z1
x=x2, y=y2, z=z2
```
You see every triple is tested.

## Pairwise Testing Approach

Instead of all 8 triples, we only want 4 tests that cover all pairs:
```
pairwise_tests = [
    ("x1", "y1", "z1"),
    ("x1", "y2", "z2"),
    ("x2", "y1", "z2"),
    ("x2", "y2", "z1"),
]

for x, y, z in pairwise_tests:
    my_function(x, y, z)
```
Output (4 tests):
```
x=x1, y=y1, z=z1
x=x1, y=y2, z=z2
x=x2, y=y1, z=z2
x=x2, y=y2, z=z1
```

## How it “covers pairs”
- Test 1: x1, y1, z1 → covers pairs (x1, y1), (x1, z1), (y1, z1)
- Test 2: x1, y2, z2 → covers (x1, y2), (x1, z2), (y2, z2)
- Test 3: x2, y1, z2 → covers (x2, y1), (x2, z2), (y1, z2)
 Test 4: x2, y2, z1 → covers (x2, y2), (x2, z1), (y2, z1)

After these 4 tests, every pair of x/y/z values appears at least once, even though we didn’t test all 8 triples.


## ISP Criteria – Pairwise (PWC)

Key idea:

Instead of testing all combinations (full combinatorial), pairwise ensures that every pair of values from different characteristics is tested at least once.
Each characteristic (variable) can have multiple values.
Example setup

You have 3 characteristics (variables) with different numbers of values:

Characteristic	Values
A	A1, A2, A3, A4
B	B1, B2, B3, B4
C	C1, C2, C3, C4
PWC rule:

"A value from each block for each characteristic must be combined with a value from every block for each other characteristic."

This just means: each value of A must appear with every value of B at least once, and with every value of C at least once, etc.
You don’t need all triples, just enough tests so that all pairs appear at least once.
How many tests?

The formula from your slide:

`Number of tests ≥ (product of two largest characteristics)`

Here, A, B, C all have 4 values → 4 × 4 = 16 tests.

That’s why your example has 16 tests:
```
A1, B1, C1   A1, B2, C2   A1, B3, C3   A1, B4, C4
A2, B1, C2   A2, B2, C3   A2, B3, C4   A2, B4, C1
A3, B1, C3   A3, B2, C4   A3, B3, C1   A3, B4, C2
A4, B1, C4   A4, B2, C1   A4, B3, C2   A4, B4, C3
```


Every pair of A & B, A & C, B & C appears at least once across these 16 tests.

T-Wise Coverage (TWC)
Pairwise is just t = 2.
You can extend it to t = 3, 4, ….
T-wise coverage:

Every combination of t characteristics is covered at least once.

Formula: product of t largest characteristic sizes

Example:

If t = 3 (triple-wise), then the number of tests ≥ 4 × 4 × 4 = 64.
If t = Q (all characteristics), then t-wise = all combinations → the exponential "all combos" case.

Intuition:

Pairwise: test every interaction between 2 variables
Triple-wise: test every interaction between 3 variables
…and so on.

Most practical testing stops at pairwise or maybe triple-wise, because full combinatorial testing grows explosively.