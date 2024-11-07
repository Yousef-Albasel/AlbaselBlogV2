---
title: "Code Examples #1 - Important Object Slicing Example"
date: 2024-01-07T16:42:29+02:00
draft: false
series: ['OOP Course Code-Examples Series']
---

Here is an example of object slicing i found in the midterm exam

```cpp
#include <iostream>
using namespace std;

class Pet
{
public:
    Pet(){};
    Pet(string name) : name(name){};
    virtual void print() { cout << name; }; // Print Pet name
protected:
    string name;
};

class Dog : public Pet
{
public:
    Dog(string breed, string petname) : breed(breed), Pet(petname){};
    virtual void print() { cout << breed << " " << name; };

private:
    string breed;
};

class Cat : public Pet
{
public:
    Cat(string name, string color) : color(color), Pet(name){};
    virtual void print() { cout << color << " " << name; };

private:
    string color;
};

class PetList
{
public:
    // initializes maxPets to n and nPets to 0 and creates an array
    PetList(int n) : maxPets(n) { pets = new Pet[maxPets]; };
    Pet &operator[](int i) { return pets[i]; };

private:
    Pet *pets;        // Pointer to dyanamic array of pets
    int maxPets = 10; // maximum number of pet objects that can be stored
    int nPets = 0;    // actual number of pet objects stored in the list
};

int main()
{

    PetList lst(3);

    lst[0] = Pet("Tito");
    lst[1] = Cat("Luna", "Fluffy");
    lst[2] = Dog("Puppy", "Ga3fr");

    for (auto i = 0; i < 3; i++)
    {
        lst[i].print();
        cout << '\n';
    }
}

```

The provided C++ code demonstrates a common issue known as "object slicing" when assigning derived class objects to a container of base class objects. In this case, the `PetList` class is intended to store instances of the `Pet` class. However, when instances of the derived classes `Cat` and `Dog` are assigned to the `PetList`, they undergo object slicing, resulting in the loss of their specific derived class attributes.

To address this issue, a solution involves changing the container from storing objects directly to storing pointers to objects. Here are the necessary modifications:

First, change the `pets` member in the `PetList` class to a pointer to a pointer:

```cpp
Pet **pets;  // Pointer to a dynamic array of pointers to Pet
```

Next, adjust the constructor and the overloaded `[]` operator in the `PetList` class:

```cpp
PetList(int n) : maxPets(n) { pets = new Pet*[maxPets]; };
Pet* &operator[](int i) { return pets[i]; };
```

Now, when creating objects in the `PetList`, allocate memory on the heap for each object and store a pointer to it:

```cpp
lst[0] = new Pet("Tito");
lst[1] = new Cat("Luna", "Fluffy");
lst[2] = new Dog("Puppy", "Ga3fr");
```

Finally, when accessing the objects in the `PetList`, use the arrow operator to invoke member functions:

```cpp
for (auto i = 0; i < 3; i++)
{
    lst[i]->print();
    cout << '\n';
}
```

By making these adjustments, the code avoids object slicing and correctly maintains the specific attributes of the derived classes within the `PetList`. Each element in the list is now a pointer to a `Pet` object, allowing polymorphism and preserving the behavior of the overridden `print` functions for `Cat` and `Dog`.
