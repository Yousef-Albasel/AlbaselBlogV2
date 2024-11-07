---
title: "Lecture Three - Pointers"
date: 2023-12-28T00:08:51+02:00
draft: false
series: ['OOP Course Notes Series']
---

> Any fool can write code the computers can understand. Only good programmers write code that humans can understand.
**-Martin Fowler**

> Any fool can write code the computers can understand. Only good programmers write code that humans can understand.
**			Martin Fowler**

they also say
> Using pointers is like dancing with the elephants **Tom Cargill**

and the inventor of C++:
> C makes it easy to shoot yourself in the foot; C++ makes it harder, but when you do it blows your whole leg off **Bjarne Stroustrup**

**These are enough reasons for you to close this page and move on to some HTML course :laughing:**

------------


But anyways let's discuss dynamic memory.

Pointers allow you to reserve new memory during runtime. (Dynamic allocation)

![](https://simplesnippets.tech/wp-content/uploads/2018/03/pointers-in-c.jpg)

Consider we have an integer a = 1025, how we will read it in memory.
![](https://i.postimg.cc/y8n4bgjN/Screenshot-1.png)

For each variable we declare in memory, a specific memory size is reserved. For instance, an `int` occupies 4 bytes, and a `char` occupies 1 byte. The way the compiler accesses it involves reading the 4 bytes sequentially.

### Why use dynamic allocation?

If you attempt to declare a large array with static storage duration (i.e., using static memory on the stack) and the array size is too large, it could lead to a stack overflow. The stack has a limited size, and attempting to allocate a large amount of memory on the stack may cause it to exceed its capacity, resulting in a stack overflow.
```cpp
    // Attempt to allocate a large array on the stack
    int staticArray[1000000];  // This may lead to a stack overflow

```
So to solve this issue, it's advisable to use dynamic memory allocation (heap allocation) instead of static memory allocation on the stack.

```cpp
    int size;
    cin >> size;
    int *arr = new int[size];
    delete[] arr;
```
The **new** operator is primarily employed to dynamically allocate a 4-byte integer on the heap, providing a pointer to the newly allocated memory.

However, it's crucial to use the **delete** operator to free up this memory. Failure to do so can lead to a memory leak issue as the program goes out of scope, preventing the proper release of the allocated memory.

| Static Memory Allocation              | Dynamic Memory Allocation                |
|---------------------------------------|------------------------------------------|
| Allocates memory at compile time.     | Allocates memory at runtime.             |
| Requires known size at compile time. | Allows size determination at runtime.    |
| Memory is on the stack.               | Memory is on the heap.  which is larger          |
| Automatic allocation and deallocation | Manual allocation and deallocation      |
| within variable scope.                | using new and delete.                   |
| Limited size determined by stack.     | Larger size, system resources limit.    |
| Suitable for fixed-size structures.   | Ideal for dynamic structures,           |
| Lifetime tied to variable scope.      | resizable arrays, dynamic data.         |

### Pointers with 2D array

This example shows how to create a 2D array using pointers, this is actually so important as it's used commonly.

```cpp
#include <iostream>

int main() {
    // Define the dimensions of the 2D array
    const int rows = 3;
    const int cols = 4;

    // Dynamically allocate memory for a 2D array
    int** twoDArray = new int*[rows];
    for (int i = 0; i < rows; ++i) {
        twoDArray[i] = new int[cols];
    }

    // Initialize the 2D array
    int counter = 1;
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            twoDArray[i][j] = counter++;
        }
    }

    // Access and print elements using pointers
    std::cout << "Accessing elements using pointers:" << std::endl;
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < cols; ++j) {
            std::cout << *(*(twoDArray + i) + j) << " ";
        }
        std::cout << std::endl;
    }

    // Deallocate memory for the 2D array
    for (int i = 0; i < rows; ++i) {
        delete[] twoDArray[i];
    }
    delete[] twoDArray;

    return 0;
}

```

**int**** **twoDArray**: Declares a pointer to a pointer of type int. This means twoDArray will point to the first element of an array of pointers.
Memory Allocation:

**new int*[rows]:** Allocates an array of int* (pointers to int) on the heap. Each element of this array will point to the first element of a row in the 2D array.

**for (int i = 0; i < rows; ++i):** Iterates through each element of the array of pointers.

**twoDArray[i] = new int[cols];: **For each element in the array of pointers, allocates a new array of int (a row in the 2D array) on the heap. The pointer twoDArray[i] now points to the first element of this row.

#### Adding 'const' to a pointer

```cpp
const int *ptr = new int(4);
ptr = new int(44);
// Value is Const, can't edit it.
    
```

The pervios example, we created a const integer, so we can't edit the value of this integer.
```cpp
    int *const ptr2 = new int(4);
   *ptr2 = 44;
    ptr2 = ptr; // Can't assign it to another address, as it's const ptr

```
but here, we created a const pointer, that means we can assign new value to it , but not assign a new pointer to it.
We can also increment and decrement a pointer.

		int values[20];
		int* pValues;
		...
		pValues = values;

		pValues += 1;

The compiler knows the size of whatever the pointer points to and increments the address in the pointer appropriately.

## Assignment

Write a type definition for pointer variables that will be used to point to
dynamic arrays. The array elements are to be of type char. Call the type
CharArray.

```cpp
#include <iostream>

typedef char* CharArray;

int main() {
    CharArray dynamicArray;
    dynamicArray = new char[10];
    dynamicArray[0] = 'H';
    dynamicArray[1] = 'e';
    dynamicArray[2] = 'l';
    dynamicArray[3] = 'l';
    dynamicArray[4] = 'o';
    dynamicArray[5] = '\0';
    std::cout << "Dynamic Array: " << dynamicArray << std::endl;
    delete[] dynamicArray;
    return 0;
}

```