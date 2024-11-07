---
title: "Lecture Eight -  OOP V (Unified Modeling Language)"
date: 2023-12-31T23:12:28+02:00
draft: false
series: ['OOP Course Notes Series']
---
Unified Modeling Language, is a standardized modeling language widely used in software engineering for visualizing, specifying, constructing, and documenting the artifacts of a software system.

I will be using this Very good reference : https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/
for most of the page, you can use any, but don't forget to check the tasks here.

These are some types of UML Diagrams.
{{< rawhtml >}}
<div style="background-color: #ffebee; border-left: 6px solid #f44336;padding:10px;text-align:left;">Please note that we are only concerned with **Class Diagram**
</div>
<br>
{{< /rawhtml >}}

| UML Diagram Type         | Description                                                                                     |
|--------------------------|-------------------------------------------------------------------------------------------------|
| Class Diagram            | Represents the static structure of a system, depicting classes, attributes, operations, and relationships.                        |
| Use Case Diagram         | Illustrates interactions between a system and its external actors, highlighting system functionalities from the user's perspective. |
| Sequence Diagram         | Shows interactions between objects over time, illustrating the flow of messages in a particular scenario.                          |
| Activity Diagram         | Represents the dynamic aspects of a system, visualizing the workflow of a process or system activities.                             |
| State Machine Diagram     | Depicts different states an object or system can be in and how it transitions between them.                                        |
| Component Diagram        | Illustrates high-level components of a system and their dependencies, showing how components are connected and interact.             |
| Deployment Diagram        | Depicts the physical deployment of software components in a hardware environment. Shows software and hardware distribution.          |
| Package Diagram           | Organizes and structures elements of a system into packages, illustrating dependencies and relationships between packages.             |
| Object Diagram           | Provides a snapshot of instances of classes in a system at a specific point in time, showing objects and their relationships.        |
| Communication Diagram    | Similar to sequence diagrams, it focuses on relationships between objects and their interactions, emphasizing structural organization.|
| Composite Structure Diagram| Describes the internal structure of a class or collaboration and how their parts are connected. Useful for modeling complex structures.|

#### UML Class Diagram notation:
![](https://cdn-images.visual-paradigm.com/guide/uml/uml-class-diagram-tutorial/02-class-notation.png)

##### 1- Class Name
- The name of the class appears in the first partition.

##### 2- Class Attributes
- Attributes are shown in the second partition.
- The attribute type is shown after the colon.
- Attributes map onto member variables (data members) in code.

##### 3- Class Operations (Methods)
- Operations are shown in the third partition. They are services the class provides.
- The return type of a method is shown after the colon at the end of the method signature.
- The return type of method parameters is shown after the colon following the parameter name.
- Operations map onto class methods in code

{{< rawhtml >}}
<div style="
background-color:#f1f1ff;
font-weight:bold;
text-align:left;
padding:10px;
border-left:green 5px solid;
">(+) denotes public attributes or operations
(-) denotes private attributes or operations
(#) denotes protected attributes or operations
(~) denotes package attributes or operations
</div>

{{< /rawhtml >}}

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/02-simple-class.png)

Exercise #1 : **Write the code used in the previous UML design :)**
[Possible Solution](https://onlinegdb.com/KPlsiyEMP "Possible Solution")
Online IDE : https://www.onlinegdb.com/online_c++_compiler

#### UML Class Relationships

**1- Inheritance** 

- Represents an "is-a" relationship.

- An abstract class name is shown in italics.

- SubClass1 and SubClass2 are specializations of Super Class. 

- A solid line with a hollow arrowhead that point from the child to the parent class

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/03-inheritance.png)

------------


**Simple Association:**

- A structural link between two peer classes.
- There is an association between Class1 and Class2
- A solid line connecting two classes

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/04-simple-association.png)

------------


**Aggregation:**

A special type of association. It represents a "part of" relationship.

- Class2 is part of Class1.
- Many instances (denoted by the *) of Class2 can be associated with Class1.
- Objects of Class1 and Class2 have separate lifetimes.
- A solid line with an unfilled diamond at the association end connected to the class of composite

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/05-aggregation.png)

------------


**Composition:**
A special type of aggregation where parts are destroyed when the whole is destroyed.

- Objects of Class2 live and die with Class1.
- Class2 cannot stand by itself.
- A solid line with a filled diamond at the association connected to the class of composite

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/06-composition.png)

------------
**Dependency:**

Exists between two classes if the changes to the definition of one may cause changes to the other (but not the other way around).

- Class1 depends on Class2

- A dashed line with an open arrow

![](https://cdn-images.visual-paradigm.com/guide/uml/what-is-class-diagram/07-dependency.png)

------------

**Multiplicity**

![](data:image/png;base64,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)



##### Here is a simple example to demonstrate relationships between classes

**ex 2:** Try reading this UML design 
![](https://i.postimg.cc/yNgXtZgV/image.png)

in This example we have a House analogy.
- a house must contain 1 **kitchen** and 1 **bathroom**, and **mutliple but not less than one** bedroom !
- it **may ** contain a Mortage and **may not**.
- it **must has** a mailbox as a part of it,** but it can exist without it**.


More complicated one? check [this article](https://cutt.ly/1wHOmzKG "this article") in medium.


**ex 3:**
> 2 Years ago a youtuber called Philza lost his 5 Years minecraft world due to a baby zombie, creeper and a spider! Let's break this scene down to a bunch of classes and objects

![](https://i.postimg.cc/yNZVrGkd/Screenshot-1.png)

So we have an abstract class called `Entity` and that entity can be a player, zombie, creeper, bat or any other mob, can be hostile or passive, can have different attributes, we also have a class for `Tools` which can be equibbed, has a durability and speed, it can be a sword, pickaxe, axe or whatever, and finally let's consider making a class for `Block` which a player can hold up to 64 per a slot. 

knowing these informations, I encourage you to make you own UML class, there is no wrong UML class design but there are bad ones, so do your best.

You can use : https://online.visual-paradigm.com/ for designing a class diagram or just draw it anywhere.

