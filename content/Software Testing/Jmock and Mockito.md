---
title: "Jmock and Mockito"
date: "2026-04-05"
category: ""
description: ""
image: "/images/unsplash-fannybeckman-1775379581446-26031a258cb1d59e.jpg"
---

# Jmock and Mockito

## Part 1: Fundamentals of Mocking in Java

Mocking is a technique used in unit testing where real objects are replaced with simulated (mock) objects. This allows you to test the behavior of a specific class (the System Under Test, or SUT) in isolation, without relying on its external dependencies (like databases, web services, or complex collaborator classes).

There are two primary paradigms in mocking that differentiate jMock and Mockito:

- **Expectation-driven (jMock)**: You define exactly what must happen before you execute the code. If the code deviates from these expectations, the test fails immediately.
- **Verification-driven / State-based (Mockito)**: You stub the methods you need, run the code, and then verify that specific interactions occurred afterward.

## Part 2: jMock Reference Guide

jMock is an expectation-based mocking framework. It strictly adheres to the philosophy that you should define the expected interactions between objects before the code is executed.

### 1. Core Concepts

- **Mockery (Context)**: The central object in jMock. It creates the mock objects and checks that all expectations have been met at the end of the test.
- **Expectations Block**: An anonymous inner class where you use a specialized Domain Specific Language (DSL) to define the exact sequence, frequency, and arguments of method calls.

### 2. Basic Syntax and Setup

To use jMock, you need a Mockery context. You define what you expect the mock to do, run your method, and the context automatically verifies if the expectations were met.

```java
import org.jmock.Expectations;
import org.jmock.Mockery;
import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
import org.junit.Test;
import static org.junit.Assert.assertTrue;

public class PaymentServiceTest {

    // 1. Setup the Mockery Context
    @Rule
    public JUnitRuleMockery context = new JUnitRuleMockery();

    @Test
    public void testProcessPayment() {
        // 2. Create the Mock Object
        final PaymentGateway mockGateway = context.mock(PaymentGateway.class);
        PaymentService paymentService = new PaymentService(mockGateway);

        // 3. Define Expectations (Arrange)
        context.checking(new Expectations() {{
            // We expect exactly ONE call to the 'charge' method
            // with the argument "1234" and 50.0. It will return true.
            oneOf(mockGateway).charge("1234", 50.0);
            will(returnValue(true));
        }});

        // 4. Execute (Act)
        boolean result = paymentService.processPayment("1234", 50.0);

        // 5. Assert results (Interactions are verified automatically by JUnitRuleMockery)
        assertTrue(result); 
    }
}
```

### 3. jMock Expectation DSL (Cheat Sheet)

- **Cardinality**: 
  - `oneOf(mock)`
  - `exactly(n).of(mock)`
  - `atLeast(n).of(mock)`
  - `allowing(mock)` (can be called any number of times)
  - `ignoring(mock)` (stubbed but not strictly verified)
  - `never(mock)`

- **Actions**: 
  - `will(returnValue(x))`
  - `will(throwException(e))`

### 4. jMock Use Cases

- **Strict Protocol Testing**: Best used when the exact order and number of calls to a dependency represent the core logic of the application (e.g., a state machine, strict communication protocol, or hardware driver interactions).
- **Fail-Fast Testing**: Because expectations are set beforehand, jMock fails immediately when an unexpected method is called, making debugging complex interactions easier.

## Part 3: Mockito Reference Guide

Mockito is currently the industry standard for Java mocking. It operates on the Arrange-Act-Assert pattern, making tests generally easier to read, write, and refactor. You stub behaviors, execute the code, and then selectively verify only the interactions you care about.

### 1. Core Concepts

- **Stubbing**: Telling the mock what to return when a specific method is called (`when(...).thenReturn(...)`).
- **Verification**: Checking that a method was called after the fact (`verify(...)`).
- **Spies**: Partial mocks where real methods are called unless explicitly stubbed (`@Spy`).

### 2. Basic Syntax and Setup

Mockito allows you to create mocks programmatically or via annotations.

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class) // Initializes annotations
public class PaymentServiceTest {

    // 1. Create the Mock Object
    @Mock
    PaymentGateway mockGateway;

    // 2. Inject the Mock into the System Under Test
    @InjectMocks
    PaymentService paymentService; 

    @Test
    public void testProcessPayment() {
        // 3. Stubbing (Arrange)
        // If charge is called with ANY string and 50.0, return true
        when(mockGateway.charge(anyString(), eq(50.0))).thenReturn(true);

        // 4. Execute (Act)
        boolean result = paymentService.processPayment("1234", 50.0);

        // 5. Assert the return value
        assertTrue(result);

        // 6. Verify interactions (Assert)
        // Verify that 'charge' was called exactly once with these arguments
        verify(mockGateway, times(1)).charge("1234", 50.0);
    }
}
```

### 3. Advanced Mockito Features for the Exam

- **Argument Captors**: Used to capture an argument passed to a mock method for deeper assertions.

```java
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
verify(mockRepository).save(captor.capture());
assertEquals("John", captor.getValue().getName());
```

- **Spies (Partial Mocks)**: Wraps a real object and executes real methods unless explicitly stubbed.

```java
List<String> list = new ArrayList<>();
List<String> spyList = spy(list);
when(spyList.size()).thenReturn(100); // Stubbed
spyList.add("one"); // Real method called
```

- **BDDMockito**: An alias for Mockito methods that aligns with Behavior-Driven Development syntax (`given(...).willReturn(...)` instead of `when(...).thenReturn(...)`).

### 4. Mockito Use Cases

- **Agile and TDD Environments**: Since you don't have to define every single interaction upfront, Mockito tests are less brittle. Adding a logging call to your method won't break a Mockito test, whereas a jMock test might.
- **General Unit Testing**: Ideal for standard business logic testing where you care mostly about the output state and a few critical side effects (like sending an email or saving to a database).
