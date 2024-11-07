---
title: "Lecture Five - OOP II (Inheritance and Constructors)"
date: 2023-12-30T01:03:40+02:00
draft: false
series: ['OOP Course Notes Series']
---

First let's Discuss **Inheritance** in C++.

####Inheritance: 

**Is to create child classes from a parent class, inheriting all it's features and more!**

Derived classes **absorb** all features of existing classes including their data and functions. Also **enhance** them by **adding** their own new features in form of new data members and new member functions

Inheritance provides us a mechanism of **software reusability** which is one of the most important principles of software engineering
![](https://cdn-images-1.medium.com/max/1080/1*gRily1Y6mlrOETJeKRgvgw.png)

####Visibility:

In C++ and other OOP languages, you need to write an access modifier when inheriting from a base class, that's what we call it visibility mode.

![](https://media.geeksforgeeks.org/wp-content/uploads/20200304134750/Visibility-Modes-in-C.jpg)

When you create private members in a class, you can't access it anywhere outside the class, you can inherit it, but not use it.
Consider this example
```cpp
class A
{
public:
    int x;

protected:
    int y;

private:
    int z;
};

```
**If you inherit using the public mode:**

- Public members stay public in the derived class, and you can access them.

- Protected members become public in the derived class, and you can access them.

- Private members remain private and are not directly accessible in the derived class.

```cpp
class B : public A
{

    void print_data()
    {
        cout << x << endl;
        cout << y << endl;
        cout << z << endl; // member "A::z" (declared at line 13) is inaccessible C/C++(265)
    }
};
```

**If you inherit using the protected mode:**

- Public members become protected in the derived class, and you can access them within the derived class (but not from outside).

- Protected members stay protected in the derived class, and you can access them within the derived class (but not from outside).

- Private members remain private and are not directly accessible in the derived class.

```cpp
class C : protected A
{

    void print_data()
    {
        cout << x << endl;
        cout << y << endl;
        cout << z << endl; // member "A::z" (declared at line 13) is inaccessible C/C++(265)
    }
};

```
**If you inherit using the private mode:**
- Public members become private in the derived class, and you can't access them directly.

- Protected members become private in the derived class, and you can't access them directly.

- Private members remain private and are not directly accessible in the derived class.

```cpp
#include <iostream>

using namespace std;

// Base class A
class A {
public:
    int x; // Public member

protected:
    int y; // Protected member

private:
    int z; // Private member
};

// Derived class D with private inheritance
class D : private A {
public:
    void print_data() {
        cout << x << endl; // Accessible (private)
        cout << y << endl; // Accessible (private)
        // cout << z << endl; // Inaccessible (private)
    }
};

int main() {
    D object_d;

    // Accessing members of D through public member functions
    object_d.print_data(); // Accessible (public)

    // Accessing members directly from main is not allowed
    // cout << object_d.x; // Inaccessible (private)
    // cout << object_d.y; // Inaccessible (private)
    // cout << object_d.z; // Inaccessible (private)

    return 0;
}
```

------------

#### Constructors
> Constructor in C++ is a special method that is invoked automatically at the time of object creation. It is used to initialize the data members of new objects generally. The constructor in C++ has the same name as the class or structure. It constructs the values i.e. provides data for the object which is why it is known as constructor. -GeekForGeeks

By default, each class has member functions:
constructor   		Date();
destructor    		~Date();
copy constructor 	Date(const Date& other);
assignment operator   Date& operator=(const Date& other);

##### Constructor:

You can make a constructor using this syntax
`class-name (args) {implement};`

This will be called to initialize an object every time you create a new one.
```cpp
class A
{
public:
    int x;

    A(int numX, int numY, int numZ)
    {
        x = numX;
        y = numY;
        z = numZ;
    };
}
```

or you can use this syntax if you are a psychopath.

`class-name (args) : member-data(argument data), member-data2(argument-data2), ... {};`
```cpp
class A
{
public:
    int x;

    A(int numX, int numY, int numZ) : x(numX), y(numY), z(numZ){};


protected:
    int y;

private:
    int z;
};

```
You can create a constructor to a derived class by creating a constructor and assigning values to the base class.
{{< rawhtml >}}
<div class="warning-container" style="background-color: #ffebee; border-left: 6px solid #f44336; padding: 10px; font-weight:bold;">Constructors should be defined for each derived class. 
  </div>
{{< /rawhtml >}}

**If there is no constructor in a derived class, a default zero-parameter  constructor will be generated which in turn calls the zero-parameter constructor in the base class to initialize the inherited members**


```cpp
class B : public A
{
protected:
    int v, w;

public:
    B(int numV, int numW, int numX, int numY, int numZ) : A(numX, numY, numZ) // or directly assign values eg : B(..):A(1,2,3){};
    {
        // assign it to the data
        numV = v;
        numW = w;
        numX = x;
        // ...
    };

}
```
| Derived Class Inherits | Derived Class doesn't inherit   |
| ------------ | ------------ |
| Every data member defined in the parent class   | The base class's constructors and destructor |
|Every ordinary member function of the parent class |The base class's assignment operator |
|The same initial data layout as the base class|The base class's friends|


------------

##### Copy Constuctors

The copy constructor in C++ is used to copy data of one object to another.

syntax : `class-name(class-name &other-object){...}`

It does not have a return type. Instead, it takes a reference parameter to another object of the same class, and proceeds to assign the values of the main class to those of the copied class

Consider this example from [programiz](https://www.programiz.com/cpp-programming/constructors "programiz")

```cpp
#include <iostream>
using namespace std;

// declare a class
class Wall {
  private:
    double length;
    double height;

  public:

    // initialize variables with parameterized constructor
    Wall(double len, double hgt) {
      length = len;
      height = hgt;
    }

    // copy constructor with a Wall object as parameter
    // copies data of the obj parameter
    Wall(Wall &obj) {
      length = obj.length;
      height = obj.height;
    }

    double calculateArea() {
      return length * height;
    }
};

int main() {
  // create an object of Wall class
  Wall wall1(10.5, 8.6);

  // copy contents of wall1 to wall2
  Wall wall2 = wall1;

  // print areas of wall1 and wall2
  cout << "Area of Wall 1: " << wall1.calculateArea() << endl;
  cout << "Area of Wall 2: " << wall2.calculateArea();

  return 0;
}
```

##### Shallow copy vs Deep copy

In a shallow copy, object B points to object A's location in memory. In deep copy, all things in object A's memory location get copied to object B's memory location.

| Characteristic                                                | Shallow Copy                                                   | Deep Copy                                                      |
|--------------------------------------------------------------|---------------------------------------------------------------|----------------------------------------------------------------|
| Storage Mechanism                                             | Stores references of objects to the original memory address.   | Stores copies of the object’s value.                            |
| Reflection of Changes                                         | Reflects changes made to the new/copied object in the original object. | Doesn’t reflect changes made to the new/copied object in the original object. |
| Object Storage                                                | Stores the copy of the original object and points the references to the objects. | Stores the copy of the original object and recursively copies the objects as well. |
| Performance                                                  | Faster                                                        | Comparatively slower                                           |

An image worth a thousand words, here are some images, then we will have a code exmaple.

![](https://i.stack.imgur.com/AWKJa.jpg)

------------



**Shallow Copy:**
![](https://i.stack.imgur.com/nJJ6K.gif)
**Deep Copy:**
![](https://i.stack.imgur.com/R6Jlg.gif)


------------

When the object has pointers, most likely you want to copy what the pointer points to, not the address in the pointer itself. You want to make a “deep copy”.

Also, because the instance that owns the pointer is responsible for calling delete on the pointer at some point (probably the destructor). 

If two objects end up calling delete on the same non-NULL pointer, heap corruption results.

Consider this example where we create a class A with a pointer member
```cpp
class A
{
public:
    int data;
    int size;
    int *pointer;

    A(int d, int s)
    {
        data = d;
        size = s;
        pointer = new int[size];
    }

    A(const A &other)
    {
        data = other.data;
        size = other.size;
        pointer = other.pointer; // Shallow copy: point to the same array
    }
};
```
Here, the pointer in the copied object is pointing to the same address as the original object.


```cpp
    A original(1, 10);
    A copy = original;

    original.pointer[0] = 1;
    copy.pointer[0] = 2;

    cout << original.pointer[0] << endl;  // Output: 2 (both point to the same array)
    cout << copy.pointer[0] << endl;      // Output: 2

```

Notice that modifying the copied object will alter the value in the original one as well, since they both reference the same memory address.

to fix this, we need to create a **Deep Copy**
```cpp
    A(const A &other)
    {
        data = other.data;
        size = other.size;
        pointer = new int[size];

        // Copy the contents of the original array to the new array
        for (int i = 0; i < size; ++i)
        {
            pointer[i] = other.pointer[i];
        }
    }
```

```cpp
   cout << original.pointer[0] << endl;  // Output: 1
   cout << copy.pointer[0] << endl;      // Output: 2
```


------------

##### Memberwise Assignment

The purpose of the copy constructor and the Memberwise assignment operator are almost equivalent -- both copy one object to another. However, the copy constructor initializes new objects, whereas the assignment operator replaces the contents of existing objects.


Can use = to assign one object to another, or to initialize an object with an object’s data

	instance2 = instance1; 

means copy all member values from instance1 and assign to the corresponding member variables of instance2

syntax : 
```
return-type &operator=(const class-name &other) {
// perfrom deep copy
return *this;
```

**ex:**
```cpp
    A& operator=(const A &other)
    {
        if (this != &other) {
            delete[] pointer; 

            data = other.data;
            size = other.size;
            pointer = new int[size];
            for (int i = 0; i < size; ++i) {
                pointer[i] = other.pointer[i];
            }
        }
        return *this;
    }
```

------------

##### Destructor

A function that is called automatically at the end of the life of an object.

`Person::~Person() { ….}`

- Destructor destroys the class objects created by constructor. 
- It is not possible to define more than one destructor. 
- Destructor takes no arguments and returns no value.
- It is automatically called when object goes out of scope. 
- In destructor, objects are destroyed in the reverse of an object creation.
- Child destructor is called before parent’s one.

When an object is dynamically allocated with the new operator.
```cpp
Rectangle *r = new Rectangle(10, 20);
```
the function responsible to free the allocated memory in the heap is `delete`

```cpp
Rectangle::~Rectangle(){
delete r;
}
```

we already discussed it in the pointers section.

------------


