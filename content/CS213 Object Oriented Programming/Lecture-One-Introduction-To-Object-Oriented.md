---
title: "Lecture One - Introduction to Object Oriented"
date: 2023-12-27T21:59:24+02:00
draft: false
series: ['OOP Course Notes Series']
---

Many languages support OOP, e.g. Java and C#, but C++ has many technicalities and rich OOP features, its implementation and runtime system make it well-adapted to the low-level application areas.


**A programming language** is a problem  solving tool.

**A program** is a solution to a problem

**A programming paradigm** is a way for organizing the program code.

**A programming language** follows one or more programming paradigm

![](https://www.learncomputerscienceonline.com/wp-content/uploads/2021/03/Programming-Paradigm.jpg)

###Notice how to write a factorial function in both 3 paradigms

#### Structured Programming

```c
#include <iostream>
using namespace std;

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; ++i) {
        result *= i;
    }
    return result;
}

int main() {
    cout << "Factorial of " << 6 << " is " 
         << factorial(n) << endl;

    return 0;
}

```

#### Object Oriented
```c
#include <iostream>
using namespace std;

class FactorialCalculator {
public:
    int calculate(int n) {
        int result = 1;
        for (int i = 2; i <= n; ++i) {
            result *= i;
        }
        return result;
    }
};
int main() {
    FactorialCalculator calculator;
    cout << "Factorial of " << 7 << " is ";
    cout << calculator.calculate(7) << endl;
    return 0;
}

```
#### Functional Programming
```cpp
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)

main :: IO ()
main = do
  putStr "Enter a non-negative integer: "
  n <- readLn
  if n < 0
    then putStrLn "Not defined for -ve nums."
    else putStrLn $ "Factorial of " 
             ++ show n ++ " is " 
             ++ show (factorial n)


```


