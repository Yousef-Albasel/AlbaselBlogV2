---
title: "Lecture Seven -  OOP IV (Object Slicing, Pointers to Object, Array of Objects)"
date: 2023-12-31T22:10:45+02:00
draft: false
series: ['OOP Course Notes Series']
---
#### Object Slicing

When a derived class object is assigned to a base class object in C++, the derived class object’s extra attributes are sliced off (not considered) to generate the base class object; and this whole process is termed object slicing. 

consider this coding example: 


we have a super class that has some integer member data (a).
```cpp
class superClass
{
protected:
    int a;

public:
    superClass(int aNum) : a(aNum){};
    virtual void display() { cout << "I'm a super class with these data: " << a << endl; };
};
```
and a derived class, with other member values b and c.

both have their own implementation of disblay function.
```cpp
class subClass : public superClass
{
protected:
    int b;
    int c;

public:
    subClass(int aNum, int bNum, int cNum) : superClass(aNum), b(bNum), c(cNum){};

    void display()
    {
        cout << "I'm a subclass! with these data: " << a << " " << b << " " << c << endl;
    }
};

void print(superClass obj) { obj.display(); } // to print the data
```

```cpp
int main()
{
    superClass f_obj(1);
    subClass s_obj(4, 5, 6);

    print(f_obj);
    print(s_obj);
}
```

Now, one would expect the output to be the message displayed by each class implementation for the display function, but instead, an unexpected behavior is observed.

```
output:
I'm a super class with these data: 1
I'm a super class with these data: 4
```

The error occurs because in the print function, we take a parameter of superClass by value,so when you pass a subClass object to this function, it gets sliced, meaning only the superClass part of the object is passed, and the additional members (b and c) are ignored.

the easy fix is to pass it by reference 
```cpp
void print(superClass& obj) { obj.display(); }
```
> Passing objects by reference rather than by value helps prevent object slicing and allows polymorphism to work as intended. When you pass an object by value, a copy of the object is made, and only the base class part of the object is retained. This process leads to object slicing, where the derived class's additional members are truncated or "sliced off."

> On the other hand, passing an object by reference (or by pointer) avoids making a copy. Instead, a reference to the original object is used. This way, the actual derived class object retains its full structure, and when calling a virtual function like display, the correct implementation from the derived class is invoked.
```
output:
I'm a super class with these data: 1
I'm a subclass! with these data: 4 5 6
```


------------

#### Pointers to objects

Basically, you can create a pointer to object!

```cpp
int main()
{
    superClass f_obj(100);
    superClass *p;

    p = &f_obj;

    (*p).display();
	// or p->display();
}
```

{{< rawhtml >}}
  <div class="warning-container" style="background-color: #ffebee; border-left: 6px solid #f44336; padding: 10px;">
  <p class="speshal-fancy-custom" align="left" style="color: red;"> You need to have <strong>(*p)</strong> in parenthesis since a dot operator has higher precedence than dereferencing.</p></div>
{{< /rawhtml >}}

**Member instances vs. Member pointers to instances**

In general use class **instances as members **
- restricts flexibility but offers more protection against error
	Because the compiler automatically constructs and destroys class
	instance members.

- Copies them on assignment and initialisation.

- If the member instance is private, access is limited to members
	functions and friend functions

**Using member pointers requires** more effort on the part of
the programmer and caution about errors

You must remember to explicitly construct and destroy the
referenced object and initialise the pointer to it.

- The size isn’t limited because it’s not created on the stack.
- The scope of the object pointer isn’t limited to the method where it’s created. We need to explicitly delete it after use to avoid memory leaks.
- There’s no need to create a copy when we try to return objects from a function.

[Check this very good explaination for `this` pointer!](https://www.geeksforgeeks.org/this-pointer-in-c/ "Check this very good explaination for `this` pointer!")


also consider this example where you need to do a type cast from a base class pointer to a derived class pointer to use a function specified for a derived class.

```c
#include <iostream>
using namespace std;
class Animal
{
private:
    int weight;
    int height;

public:
    Animal(int h, int w) : weight(w), height(h){};
};

class Cat : public Animal
{
public:
    Cat(int h, int w) : Animal(w, h){};
    void meow()
    {
        cout << "Meow :3 uwu\n";
    }
};

int main()
{
    Animal *some_animal = new Cat(100, 200);

    // some_animal.meow(); // Error,you can't access the function like this

    ((Cat *)some_animal)->meow(); // Works

    delete some_animal;
}

```

------------

#### Array of Objects

Objects can be the elements of an array:

`InventoryItem inventory[40];`
Default constructor for object is used when an array is defined.

Must use initializer list to invoke constructor that
takes arguments.

if a constructor takes one argument:

```c
InventoryItem inventory[3] = {"Hammer", "Wrench", "Pliers"};
```

if it takes more than one argument:

```c
InventoryItem inventory[3] =
{InventoryItem("Hammer",6.9,4.20),InventoryItem("Nail",10.2,2.20), InventoryItem("ScrewDriver",2.9,3.01)};
```

##### Using Dynamic arrays

Back to our animal and cat example, if we need to create an array of animals, we may use.

**1 - `new` operator**
```c 
Animal* animals = new animals[4];
```
**2 - using `malloc()`**
```c
Animal* a = (Animal*) malloc(sizeof(Animal) * 3);
```
**3 - Using an array of pointers**
```c
Animal* animals[] =

{new Animal("animal"),

new Cat("cat"),

new Dog("dog")};
```
**4 - Using pointer to pointers (because you are a weirdo)**
```c
Animal** animals = new Animal*[3];

animals[0] = new Animal("animal");

animals[1] = new Cat("cat");

animals[2] = new Dog("dog");
```

**5 - Using STLS like vector**


------------

Now we are officially done with all the important OOP Concepts, next  we will discuss **(Unified Modeling Language)** with interactive examples.

