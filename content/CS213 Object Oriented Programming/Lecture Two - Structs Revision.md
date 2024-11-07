---
title: "Lecture Two -   Structs Revision"
date: 2023-12-27T22:45:47+02:00
draft: false
series: ['OOP Course Notes Series']
---
Structure: C++ construct that allows multiple related variables to be grouped together

**General Format**:  
```cpp
struct <structName>
{
	type1 field1;
	type2 field2;
	. . .
}; // must have ; 

```
**How to access structs?**
You can access structs and assign new date using the . operator, you also can use the input streams with it.
```cpp
cin >> stud1.studentID;
	getline(cin, stud1.name);
	stud1.gpa = 3.75;
```
**ex1:**

![](https://linuxhint.com/wp-content/uploads/2021/08/Structures-in-C-2.png)

Cannot compare struct variables directly:
`if (stud1 == stud2) // won’t work
`
Instead, must compare on a field basis:
`if (stud1.studentID == stud2.studentID) ...`

**Can also overload < and == operators**

#### How to initialize a struct ?
struct variable can be initialized when defined:
`Student s = {11465, "Joan", 2, 3.75};`
Can also be initialized member-by-member after definition:
`s.name = "Joan";`
`s.gpa = 3.75;`

**You can also use a constructor with structs**
```cpp
struct Dimensions
{
  int length, width, height;

  // Constructor  
  Dimensions(int l, int w, int h) {
     length = l; width = w; height = h;
  }
};
```
You can initialize a struct using a constructor, or use copy constructor
```cpp
struct student s2 = {15, "Saurav", 12500};
struct student s1;
s1 = s2;
  
```

### Structs can have nested structs!

```cpp
A structure can have another structure as a 
member. 
 struct ID
 {  string name;
    string Country;
 };
 struct License { 
 ID identification;
 string expiration_date;
 };
```

## Assignment:

Write a definition for a structure type for records consisting of a person’s
wage rate, accrued vacation (which is some whole number of days), and
status (which is either hourly or salaried). Represent the status as one of
the two char values 'H' and 'S'. Call the type EmployeeRecord

```cpp
#include <iostream>
#include <string>

using namespace std;

struct EmployeeRecord {
    double wageRate;
    int accruedVacation;
    char status;
};

int main() {
    EmployeeRecord employee1;
    employee1.wageRate = 25.50;
    employee1.accruedVacation = 10;
    employee1.status = 'H';

    cout << "Employee 1 Information:" << endl;
    cout << "Wage Rate: $" << employee1.wageRate << " per hour" << endl;
    cout << "Accrued Vacation: " << employee1.accruedVacation << " days" << endl;
    cout << "Status: " << (employee1.status == 'H' ? "Hourly" : "Salaried") << endl;

    return 0;
}

```
