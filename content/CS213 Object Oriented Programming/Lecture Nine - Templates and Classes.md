---
title: "Lecture Nine   Templates and Classes"
date: 2024-01-02T23:35:26+02:00
draft: false
series: ['OOP Course Notes Series']
---
**Function template:** a pattern for a function that can work with many data types

- When written, parameters are left for the data types
- When called, compiler generates code for specific data types determined in function call.

- Better than Function Overloading:
- You need to create only one version of the function
1- Bug fixes will be in one place
2- But number of parameters will be fixed. 

**When passing a class object to a function template, ensure that all operators performed by the function template are defined or overloaded in the class definition**

```cpp
// C++ Program to demonstrate
// Use of template
#include <iostream>
using namespace std;

// One function works for all data types. This would work
// even for user defined types if operator '>' is overloaded
template <typename T> T myMax(T x, T y)
{
	return (x > y) ? x : y;
}

int main()
{
	// Call myMax for int
	cout << myMax<int>(3, 7) << endl;
	// call myMax for double
	cout << myMax<double>(3.0, 7.0) << endl;
	// call myMax for char
	cout << myMax<char>('g', 'e') << endl;

	return 0;
}
// src : GFG
```

**Class templates** like function templates, class templates are useful when a class defines something that is independent of the data type. Can be useful for classes like LinkedList, BinaryTree, Stack, Queue, Array, etc. 

```cpp
// C++ Program to implement
// template Array class
#include <iostream>
using namespace std;

template <typename T> class Array {
private:
	T* ptr;
	int size;

public:
	Array(T arr[], int s);
	void print();
};

template <typename T> Array<T>::Array(T arr[], int s)
{
	ptr = new T[s];
	size = s;
	for (int i = 0; i < size; i++)
		ptr[i] = arr[i];
}

template <typename T> void Array<T>::print()
{
	for (int i = 0; i < size; i++)
		cout << " " << *(ptr + i);
	cout << endl;
}

int main()
{
	int arr[5] = { 1, 2, 3, 4, 5 };
	Array<int> a(arr, 5);
	a.print();
	return 0;
}
// src : GFG
```
{{< rawhtml >}}
<div>
<p style = "
background-color: #ffebee;
border-left: #f44336 6px solid;
text-align:left;
padding :10px;
font-weight:bold;
">Must use type parameter T everywhere base class name is used in derived class
</p>
</div>
{{< /rawhtml >}}


You can also give it more than 1 argument

```c
// C++ Program to implement
// Use of template
#include <iostream>
using namespace std;

template <class T, class U> class A {
	T x;
	U y;

public:
	A() { cout << "Constructor Called" << endl; }
};

int main()
{
	A<char, char> a;
	A<int, double> b;
	return 0;
}
// src : GFG
```

#### Varadic Templates

You can have a function template that takes multiple undetermined arguments, kinda like recursion, you have to specify a base case.

```c
template <typename T>
T add(T value)
   {return value;}  // 1 value and i like to call this a base

template <typename T, typename... Ts>
T add(T head, Ts... rest)
   {return head + add(rest...);}
```

```c
int main () {
    string s1 = "Ali", s2 = " Baba";
    cout << add (s1, s2) << endl;
    cout << add (1,2,3,4,5) << endl;
    cout << add (true, false) << endl;
}
```

#### Overloaded [] Operator

- Can provide boundary-checking on subscripts
- Can perform hidden dynamic re-allocation
- Can use templates to dynamically determine the array data type


#### Program Yousef Vector -> Code examples section
