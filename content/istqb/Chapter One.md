---
title: "Chapter One"
date: "2026-03-03"
category: "istqb"
description: ""
---

# Fundamentals of testing


**Testing Principle - Exhaustive testing is impossible**
Testing everything (all combinations of inputs and preconditions) is not feasible except for
trivial cases. Instead of exhaustive testing, we use risks and priorities to focus testing efforts.

## How do we define Software Testing

-  Process - Testing is a process rather than a single activity - there are a series
of activities involved. 

- Some of
the testing we do is focused on checking products against the specification
for the product; for example we review the design to see if it meets require
ments, and then we might execute the code to check that it meets the design.
If the product meets its specification, we can provide that information to
help stakeholders judge the quality of the product and decide whether it is
ready for use. 


**Pesticide paradox**
If the same tests are repeated over and over again, eventually the same set of test cases will
no longer find any new bugs. To overcome this 'pesticide paradox', **the test cases need to
be regularly reviewed and revised**, and new and different tests need to be written to exercise
different parts of the software or system to potentially find more defects.


![image.png](/images/paste-1772530942068-04c9f4834f12bdc7.png)



**Testing Principle - Absence of errors fallacy** Finding and fixing defects does not help if the system built is unusable and does not fulfill the
users' needs and expectations.


![image.png](/images/paste-1772531192404-a10f012259daf8a3.png)


**Test Control**
- Measure and analyze the results of reviews and testing: We need to know
how many reviews and tests we have done. We need to track how many
tests have passed and how many failed, along with the number, type and
importance of the defects reported.
- Monitor and document progress, test coverage and exit criteria: It is important
that we inform the project team how much testing has been done, what the
results are, and what conclusions and risk assessment we have made. We must
make the test outcome visible and useful to the whole team.
- Provide information on testing: We should expect to make regular and
exceptional reports to the project manager, project sponsor, customer and
other key stakeholders to help them make informed decisions about
project status. We should also use the information we have to analyze the
testing itself.
- Initiate corrective actions: For example, tighten exit criteria for defects fixed,
ask for more effort to be put into debugging or prioritize defects for fixing
test blockers.
- Make decisions: Based on the measures and information gathered during
testing and any changes to business and project risks or our increased under
standing of technical and product risks, we'll make decisions or enable others
to make decisions: to continue testing, to stop testing, to release the software
or to retain it for further work for example