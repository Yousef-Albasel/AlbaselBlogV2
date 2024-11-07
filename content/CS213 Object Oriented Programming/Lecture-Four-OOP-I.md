---
title: "Lecture Four - OOP I (Identity, Classification, Abstraction, Encapsulation)"
date: 2023-12-28T01:16:27+02:00
draft: false
series: ['OOP Course Notes Series']
---
**Object-orientation** is a way of thinking about problems using models built from real-world concepts.

and i've already made a page for the main concepts in my (OO though process) book summary you WILL need to [check it out](https://albasel.netlify.app/books/object-oriented-thought-process/object-oriented-thought-process/ "check it out").

History of OOP [(Found in linkedin)](https://www.linkedin.com/advice/0/how-did-oop-evolve-from-procedural "(Found in linkedin)")

> **Object-oriented programming has its roots in the research and experiments of computer scientists in the 1960s and 1970s. One of the pioneers of OOP was Ole-Johan Dahl, who along with Kristen Nygaard, developed the first object-oriented language, Simula, in 1967. Simula introduced the concepts of classes, objects, inheritance, and polymorphism, which are the core features of OOP. Another influential figure was Alan Kay, who along with his colleagues at Xerox PARC, developed the language Smalltalk in 1972. Smalltalk was the first pure object-oriented language, where everything was an object, even numbers and functions. Smalltalk also introduced the concepts of dynamic typing, garbage collection, and graphical user interface.**

Yea, no one cares.

Let's talk about some more important Concepts:

------------


#### Object Identity:
**means that data is quantized into discrete, distinguishable, entities called objects, it can be concrete like a car, of conceptual like a plan or a feeling.**

Each object has its own identity even if two objects have exactly the same attributes. They are still different separate objects. 

Each object has something unique which distinguishes it from all its fellow objects. It is its memory address (or handle) that is referred to by one or more object identifiers (OID)

------------
#### Object Classification:

**Classification** means that objects with the same data structure (attributes) and behavior (operations) belong to the same class

![](https://web.mit.edu/mecheng/pml/spec_class-2.jpg)


------------
#### Abstraction:
 
Abstraction is the selective examination of certain aspects of a problem.

**Does that make sense?**

Here is an analogy of abstraction might work like this:  [reference](https://www.techtarget.com/whatis/definition/abstraction "reference")
{{< rawhtml >}}
<p style = "
background-color:#f2f2f2;
padding : 10px;
border-left: 6px solid grey;
">
You <strong>(the object)</strong> are arranging to meet a blind date (lucky you :wink:	)  and are deciding what to tell them so that they can recognize you in the restaurant.

You decide to include the information about where you will be located, your height, hair color, and the color of your jacket.

<strong>This is all data that will help the procedure (your date finding you)</strong>. 

On the other hand, there are a lot of bits of information about you that aren't relevant to this situation: your social security number, your admiration for obscure films, and what you took to "show and tell" in fifth grade are all irrelevant to this particular situation because they won't help your date find you. 
</p>
{{< /rawhtml >}}
So, abstraction is to isolate the aspects that are important for some purpose and suppress the unimportant aspects.


------------

#### Encapsulation:

**Encapsulation** separates the external aspects of an object, that are accessible to other objects, from the internal implementation details that are hidden from other objects.

so you can change the implementation of a class (to enhance performance, fix bugs, etc.) without affecting the applications that use objects of this class.

first let's understand what **interface** is : 

In general, an interface is simply "what the class looks like to the rest of the world".

consider this example in java:
```java
class Car {
private string engine_turn_on(){...};
 public void Drive(string s){...}
}
```
So the normal user will only deal with the interface (`Drive`) and will not care for the implementation (Turning the engine on, consumption of fuel..etc)

That takes us to another concept which is **Data Hiding** which is used to hide internal object details (i.e., data members). Data hiding guarantees exclusive data access to class members only and protects and maintains object integrity by preventing intended or unintended changes and intrusions.

and again, I have included more info regarding the difference between encapsulation and data hiding [here](https://albasel.netlify.app/books/object-oriented-thought-process/object-oriented-thought-process/ "here").

------------


let's practise some important applications.

**For these tasks, I'll need you to write the implementation in a non-IDE environment. Then, take the plain text and compile it using an IDE. You can even write it on paper if necessary; the goal is to understand how to write it without relying on an IDE or AI assistant.**

Plain Text Editor: https://www.onlinetexteditor.com/
Online Compiler : https://www.onlinegdb.com/online_c++_compiler

or use VIM to both write and compile.

Then send the link of your implementation in the comments to discuss it :smile:

**Task 1:** Write a stack implemented in C using structs. [solution](https://onlinegdb.com/SXpqAtDNo "solution")

**Task 2:** Write a stack implemented in C++ using classes. [solution](https://onlinegdb.com/JAi5CEnls "solution")

**Task 3:** Write a stack implemented in C++ using classes and operator overloading [solution](https://onlinegdb.com/pOqCNeyq4 "solution")

**Task 4:** Write a stack implemented in C++ using classes,operator overloading, and vectors. [solution](https://onlinegdb.com/pOqCNeyq4 "solution")

{{< rawhtml >}}
  <div class="warning-container" style="background-color: #ffebee; border-left: 6px solid #f44336; padding: 10px;">
    <p class="speshal-fancy-custom" align="center" style="color: red; font-size:16px;"> Note that in the pervious task, it is essential to declare the ostream as a <strong>friend</strong> to avoid errors related to accessing private members.
    </p>
  </div>
{{< /rawhtml >}}

Next we will discuss inheritance and polymorphism.




