---
title: "Lecture Six -   OOP III (Polymorphism, override, overload, virtual, friend)"
date: 2023-12-31T19:35:50+02:00
draft: false
series: ['OOP Course Notes Series']
---


**Function Overloading:** provides multiple definitions of the function by changing signature i.e. changing number of parameters, change datatype of parameters, return type doesn’t play any role. 

```cpp
// overloaded functions
void test(int);
void test(float);
void test(int, float);

// Method 1
void test(int var)
{
    cout << "Integer number: " << var << endl;
}
 
// Method 2
void test(float var)
{
    cout << "Float number: "<< var << endl;
}
 
// Method 3
void test(int var1, float var2)
{
    cout << "Integer number: " << var1;
    cout << " and float number:" << var2;
}
```

```cpp
int main()
{
    int a = 5;
    float b = 5.5;

	test(a); // Integer number: 5
    test(b); // Float number: 5.5
    test(a, b); //Integer number: 5 and float number:5.5
}
```

**Function Overriding: **(achieved at run time)
It is the redefinition of base class function in its derived class with same signature i.e. return type and parameters. 

```cpp
Class a
{
public: 
      virtual void display(){ cout << "hello"; }
};

Class b:public a
{
public: 
       void display(){ cout << "bye";}
};
```

```cpp

int main()
{
    a one;
    b two;

    one.display(); // "hello"
    cout << endl;
    two.display(); // "bye"
}
```

Now what if we didn't use the keyword `virtual` in the pervious example, and created an instance of **b** using a pointer of type **a**.
```cpp
int main()
{
    a *p;
    b two;

    p = &two;

    p->display(); // hello
}
```
When calling display for an object of **b**, then the function calls will be resolved at compile time based on the static type of the pointer or reference used to call the function. This is known as **static** or **compile-time polymorphism.**

Basically, **a virtual function** is used in the base class in order to ensure that the function is overridden. This especially applies to cases where a pointer of base class points to an object of a derived class.
![](https://cdn.programiz.com/sites/tutorial2program/files/cpp-virtual-function.png)
------------


### Polymorphism
The process of allowing each class to provide its own implementation of a function defined in a common base class is what we refer to as polymorphism.

polymorphism enables objects of different derived classes to be treated as objects of a common base class, fostering flexibility in the program's structure and facilitating dynamic method invocation based on the actual type of the object at runtime

#### Compile-Time Polymorphism

it has two types :

##### a. Function overloading

When there are multiple functions with the same name but different parameters, then the functions are said to be overloaded. (we discussed it earlier)

##### b. Operator overloading

C++ has the ability to provide the operators with a special meaning for a data type, this ability is known as operator overloading. For example, we can make use of the addition operator (+) for string class to concatenate two strings.

```cpp
#include <iostream>

class Point {
private:
    int x;
    int y;

public:
    Point(int x, int y) : x(x), y(y) {}

    // Overloading the + operator for Point objects
    Point operator+(const Point& other) const {
        return Point(x + other.x, y + other.y);
    }

    // Display the point
    void display() const {
        std::cout << "x: " << x << ", y: " << y << std::endl;
    }
};

int main() {
    // Creating two points
    Point p1(1, 2);
    Point p2(3, 4);

    // Using the overloaded + operator
    Point result = p1 + p2;

    // Displaying the result
    std::cout << "Result: ";
    result.display();

    return 0;
}

```

#### Run-time Polymorphism
In runtime polymorphism, the compiler resolves the object at run time and then it decides which function call should be associated with that object. It is also known as dynamic or late binding polymorphism.

**refelect on the virtual function example**


------------

#### Friend Class

A friend class can access private and protected members of other classes in which it is declared as a friend.

```cpp
class myClass {
private:
    int private_variable;
 
protected:
    int protected_variable;
 
public:
    myClass()
    {
        private_variable = 10;
        protected_variable = 99;
    }

    // friend class declaration
    friend class F;
};

```
doing that, i can easily access any private or protected members in class myClass inside the friend class

```cpp
class F{
    public:
        void display(myClass& obj){
            cout << obj.private_variable << " " << obj.protected_variable << endl;
        }
};
```

#### Friend Functions
Like a friend class, a friend function can be granted special access to private and protected members of a class in C++.

```cpp
#include <iostream>
using namespace std;
class myClass
{
private:
    int private_variable;

protected:
    int protected_variable;

public:
    myClass()
    {
        private_variable = 10;
        protected_variable = 99;
    }
    // friend function
    friend void display_data(myClass &obj);
};

void display_data(myClass &obj)
{
    cout << obj.private_variable << " " << obj.protected_variable << endl;
}

int main()
{
    myClass a;
    display_data(a);
}
```

or you can give it a special access to a function inside another class eg:
```cpp
#include <iostream>
using namespace std;
class myClass;
class otherClass
{

public:
    void show_important_data(myClass &obj);
};

class myClass
{
private:
    int private_variable;

protected:
    int protected_variable;

public:
    myClass()
    {
        private_variable = 10;
        protected_variable = 99;
    }
    // friend function
    friend void otherClass::show_important_data(myClass &);
};

void otherClass::show_important_data(myClass &obj)
{
    cout << obj.private_variable << " " << obj.protected_variable << endl;
}
int main()
{
    myClass a;
    otherClass b;
    b.show_important_data(a);
}
```

| **Advantages of Friend Functions**                                | **Disadvantages of Friend Functions**                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| - A friend function is able to access members without inheriting the class. | - Friend functions have access to private members, violating data hiding. |
| - Acts as a bridge between two classes, accessing their private data. | - Friend functions cannot achieve run-time polymorphism in their members. |
| - Increases the versatility of overloaded operators.             |                                                                   |
| - Can be declared in the public, private, or protected part of the class. |                                                                   |

