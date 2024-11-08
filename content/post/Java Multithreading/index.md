+++
author = "Yousef Albasel"
title = "Java Multithreading"
date = "2024-11-8"
description = "Tutorial for Java Multithreading"
categories = [
    "Software Engineering",
]
tags = [
    "Notes"
]

image = "java.png"
+++

# Java Multithreading Notes

These are course notes taken from **[Rayan Slim](https://www.youtube.com/@RayanSlim087)** Multithreading playlist, which is really good and worth the watch.

**Multithreading** in Java is a process of executing multiple threads simultaneously.

A thread is a lightweight sub-process, the smallest unit of processing. Multiprocessing and multithreading, both are used to achieve multitasking.

In Java, a thread always exists in any one of the following states. These states are:

1.  New
2.  Active
3.  Blocked / Waiting
4.  Timed Waiting
5.  Terminated

## Explanation of Different Thread States

**New:**  Whenever a new thread is created, it is always in the new state. For a thread in the new state, the code has not been run yet and thus has not begun its execution.

**Active:**  When a thread invokes the start() method, it moves from the new state to the active state. The active state contains two states within it: one is  **runnable**, and the other is  **running**.

**Blocked or Waiting:**  Whenever a thread is inactive for a span of time (not permanently) then, either the thread is in the blocked state or is in the waiting state.

**Terminated:**  A thread reaches the termination state because of the following reasons:

-   When a thread has finished its job, then it exists or terminates normally.
-   **Abnormal termination:**  It occurs when some unusual events such as an unhandled exception or segmentation fault.
![Java thread life cycle](https://images.javatpoint.com/core/images/life-cycle-of-a-thread.png)


### Creating a Thread


```java
public static class ChildThreadTask implements Runnable{  
 @Override public void run(){ count(); }}
 ```
This class is used to create a thread that executes the `count()` method when started.

Or we can use lambda expression 
```java
Thread T1 = new Thread( () -> {count();});
```
### Setting Priority
When giving max priority, it doesn't mean it will be the first to run, but we can gurantee it finishes first
```java
T2.setPriority(Thread.MAX_PRIORITY);
```

To make other threads surrender or give away thier turn in running we can use Yeild()

`Thread.yield()` in Java is a static method that signals to the thread scheduler that the current thread is willing to pause its execution and allow other threads of the same or higher priority to run. However, there are important details to understand about what `yield()` does and doesn't do:

## Example

Now having these three threads: Thread - 0, Thread - 1 and Thread - 2
First two are of the same priority 
``` java
Thread T1 = new Thread( () -> {count();});  
Thread T2 = new Thread( () -> {count();});  
Thread T3 = new Thread( () -> {count();});  
T1.setPriority(Thread.MAX_PRIORITY);  
T1.start();  
T2.setPriority(Thread.MAX_PRIORITY);  
T2.start();
```
We also have a count method that will run when a thread starts, printing some information, and a yield method.
```java
  
public static void count(){  
    for (int i = 0; i < 100; i++) {  
        System.out.println("Current Thread: " + Thread.currentThread().getName() + " It's state is " + Thread.currentThread().getState() + " With Prioirty " + Thread.currentThread().getPriority() + " Counting - " + i);  
        if (!Thread.currentThread().getName().equals("Thread-2")) {  
            Thread.yield();  
        }  
  
       }  
}
```

The expected output for this code, Both threads with the highest priority will be executed at some turn, then they will alternate execution due to yield, and continue running until they finish, Thread-2 will not get affected by Yeild since it's out the condition.

```
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 81
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 80
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 82
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 81
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 83
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 82
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 84
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 83

Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 81
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 80
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 82
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 81
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 83
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 82
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 84
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 83
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 85
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 84
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 86
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 85
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 87
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 86
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 88
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 87
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 89
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 88
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 90
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 91
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 89
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 92
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 90
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 3
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 93
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 91
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 4
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 94
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 92
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 95
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 5
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 93
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 96
Current Thread: main It's state is RUNNABLE With Prioirty 5 Counting - 4
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 6
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 94
Current Thread: main It's state is RUNNABLE With Prioirty 5 Counting - 5
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 95
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 97
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 7
Current Thread: main It's state is RUNNABLE With Prioirty 5 Counting - 6
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 96
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 98
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 97
Current Thread: Thread-0 It's state is RUNNABLE With Prioirty 10 Counting - 99
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 98
Current Thread: Thread-1 It's state is RUNNABLE With Prioirty 10 Counting - 99
```
Now that Thread -1 finished, Another Thread starts, doesn't yield though.
```
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 8
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 9
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 10
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 11
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 12
Current Thread: main It's state is RUNNABLE With Prioirty 5 Counting - 7
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 13
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 14
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 15
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 16
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 17
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 18
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 19
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 20
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 21
Current Thread: Thread-2 It's state is RUNNABLE With Prioirty 5 Counting - 22
```

# Thread Inheritance

In this section we are trying to be a little more organized and leverage the use of Object Oriented Architecture for managing and creating threads.

All we have to do is create a class that extends Thread class, override it's run method and add your own logic 

```java
  
public class AtheleteThread extends Thread{  
    private int bibNumber;  
  
    public AtheleteThread(int bibNumber) {  
        this.bibNumber = bibNumber;  
    }  
  
    public int getBibNumber() {  
        return bibNumber;  
    }  
  
    public void setBibNumber(int bibNumber) {  
        this.bibNumber = bibNumber;  
    }  
  
    @Override  
  public void run() {  
        double distanceKM = 10;  
        double steps = 0.00000001;  
  
        for (double i = 0; i <= distanceKM; i += steps) {  
            if (Math.abs(i - distanceKM) < steps) {  
                System.out.println("\nAthlete number " + bibNumber + " has finished the race.\n");  
                break;  
            }  
        }  
    }  
}
```

Then all you have to do is 
```java
AtheleteThread firstAthelete  = new AtheleteThread(123123);  
AtheleteThread secondAthelete  = new AtheleteThread(999999);  
  
firstAthelete.start();  
secondAthelete.start();
```
And that's much cleaner than having to do this
```java
  
public static void main(String[] args) {  
    // Creating the first athlete thread  
  Thread firstAthlete = new Thread(() -> {  
        int bibNumber = 84921;  
        runRace(bibNumber);  
    });  
  
  
    // Creating the second athlete thread  
  Thread secondAthlete = new Thread(() -> {  
        int bibNumber = 43114;  
        runRace(bibNumber);  
    });  
  
    // Starting the threads  
  firstAthlete.start();  
    secondAthlete.start();  
}  
  
private static void runRace(int bibNumber) {  
    double distanceKM = 10;  
    double steps = 0.00000001;  
  
    for (double i = 0; i <= distanceKM; i += steps) {  
        if (Math.abs(i - distanceKM) < steps) {  
            System.out.println("\nAthlete number " + bibNumber + " has finished the race.\n");  
            break;   
        }  
    }  
}
```

# Thread Joinning

**Thread joining** is a mechanism in Java (and many other programming languages) that allows one thread to wait for the completion of another. It is achieved using the `join()` method provided by the `Thread` class.

### How `join()` Works:

-   When `threadA.join()` is called in the context of another thread (e.g., `threadB`), `threadB` will pause its execution and wait until `threadA` has completed its execution.
-   Once `threadA` finishes, `threadB` resumes execution from the point where it called `join()`.


In this example we have 4 Threads, each representing a player doing progress on some game, calculating score, when finished the main threads displays the player with most score.

```java
PlayerThread[] threads = new PlayerThread[4];  
  
for (int i = 0; i < threads.length; i++) {  
    threads[i] = new PlayerThread(i+1);  
    threads[i].start();  
}  
  
// TODO: Task One - Wait for all player threads to finish  
  
// Determine the player with the highest score  
int winningScore = 0;  
int winner = 0;  
for (int i = 0; i < threads.length; i++) {  
    if (threads[i].getScore() > winningScore) {  
        winningScore = threads[i].getScore();  
        winner = i + 1;  
    }  
}  
  
System.out.println("Player " + winner + " wins with a score of " + winningScore);
```

But you can notice that, the main thread finished faster that all 4 threads
and this is an issue
```
Player 1 wins with a score of 504
Player 1 final score: 1349982150
Player 4 final score: 1350016018
Player 3 final score: 1350107767
Player 2 final score: 1350004850
```

A simple solution is using `Join()`, by calling it for each player thread, while on the main thread. It will cause the main thread to pause until all player threads finished

```java
for (PlayerThread player : threads){  
    player.join();  
}
```

```Player 1 final score: 1350029760
Player 4 final score: 1350028067
Player 2 final score: 1349911192
Player 3 final score: 1349980041
Player 1 wins with a score of 1350029760
```

# Daemon Threads

Daemon threads are special types of threads in Java that run in the background and do not prevent the program from exiting. The key characteristic of daemon threads is that they **do not block the JVM from shutting down** when all non-daemon (user) threads have completed. They are designed to perform background tasks, such as monitoring or housekeeping operations.


-   **Background Operation**: Daemon threads are typically used for tasks that are not crucial to the main execution of the program, like garbage collection, logging, or periodic checks. They work in the background while the main (user) threads are executing.
    
-   **JVM Shutdown**: The JVM can terminate as soon as all **non-daemon** threads (user threads) have finished. When there are only daemon threads left, the JVM will exit, even if the daemon threads are still running. This means daemon threads don't prevent the program from exiting, which is different from regular user threads that will cause the program to wait until they finish.
    
-   **Setting a Thread as Daemon**: You can make a thread a daemon thread by calling the `setDaemon(true)` method before starting it. This must be done before the thread is started; otherwise, an `IllegalThreadStateException` will be thrown
.

In this example we are creating two threads, one which performs a very intensive task, then finishes. other is used for logging

```java
Thread memoryMonitorThread = new Thread(new MemoryMonitorDaemon());  
memoryMonitorThread.start();  
  
Thread memoryIntensiveTaskThread = new Thread(new MemoryIntensiveTask());  
memoryIntensiveTaskThread.start();
```

having the code like this, the logging thread will keep executing
```java
public class MemoryMonitorDaemon implements Runnable {  
  
    @Override  
  public void run() {  
        Runtime runtime = Runtime.getRuntime();  
  
        while (true) {  
            try {  
                long usedMemory = runtime.totalMemory() - runtime.freeMemory();  
                System.out.println("Memory Usage: " + usedMemory + " bytes");  
                Thread.sleep(5000); // Check memory usage every 5 seconds  
  } catch (InterruptedException e) {  
                System.out.println("Memory monitor interrupted");  
            }  
        }  
    }  
}
```

```java
import java.util.ArrayList;  
import java.util.Random;  
  
public class MemoryIntensiveTask implements Runnable {  
  
    @Override  
    public void run() {  
        ArrayList<Integer> numbers = new ArrayList<>();  
        Random random = new Random();  
  
        try {  
            for (int i = 0; i < 100000; i++) { // Reduced number of iterations  
  numbers.add(random.nextInt());  
                if (i % 1000 == 0) {  
                    Thread.sleep(150); // Adds a slight delay every 1000 iterations  
  }  
            }  
        } catch (InterruptedException e) {  
            System.out.println("Memory intensive task was interrupted");  
        }  
  
        System.out.println("Finished generating random numbers");  
    }  
}
```

After the intensive task thread finishes we can see that the logging thread still running which makes no sense.
```
Memory Usage: 2978040 bytes
Memory Usage: 4384032 bytes
Memory Usage: 5255840 bytes
Memory Usage: 6269928 bytes
Finished generating random numbers
Memory Usage: 6269928 bytes
```
**Lifecycle**: Daemon threads are typically **short-lived**. Since the JVM doesn't wait for daemon threads to finish, they may be abruptly terminated when the program exits, even if they haven't completed their work.

How we can solve this is by setting the logging thread as daemon thread
```java
memoryMonitorThread.setDaemon(true);
```

```
Memory Usage: 3271760 bytes
Memory Usage: 4194304 bytes
Memory Usage: 5255840 bytes
Memory Usage: 6269928 bytes
Finished generating random numbers

Process finished with exit code 0

```

# Reducing Latency

### 1. **Latency in Threading**:

In threading, **latency** refers to the **delay** or **waiting time** between when a thread is scheduled to run and when it actually starts executing, or the time taken to complete a task. This is typically seen as the amount of time it takes for a thread to begin processing or the delay involved in switching between threads.

#### Examples in Threading:

-   **Thread Start Latency**: The delay between when you create and start a thread and when it actually begins running on a processor. This includes the time to schedule the thread, the overhead of context switching, and any delays introduced by operating system thread management.
-   **Context Switch Latency**: When the operating system switches the CPU from one thread to another, there is a time delay involved, often known as a "context switch". This can impact the overall response time, especially in real-time systems.
-   **Task Completion Latency**: The time it takes for a thread to complete its work. For example, if a thread performs a computation, latency could refer to how long it takes to finish that task from the time it started.

### 2. **Throughput in Threading**:

In threading, **throughput** refers to the **amount of work** or **number of tasks** that are completed in a given period of time. It’s a measure of how many operations a set of threads can execute per unit of time. Essentially, it refers to how efficiently multiple threads can process tasks concurrently.

#### Examples in Threading:

-   **Task Throughput**: If you have a thread pool, the throughput could refer to how many tasks are processed by the threads in the pool per second.
-   **Parallel Throughput**: In parallel computing, throughput can be seen as the number of tasks or operations performed by all threads in a multithreaded application in a given period of time.


# Data Race

A **data race** occurs in concurrent programming when two or more threads access the same memory location at the same time, and at least one of the threads modifies the value. The issue arises because the threads are not properly synchronized, leading to unpredictable results or bugs in the program.
```javac
// Thread 1
x++;

// Thread 2
x++;
```
If both threads read the value of `x` at the same time before either writes back their incremented value, the final value of `x` might not be what is expected. Both threads may read the same value of `x` (let's say 5), increment it, and write back 6, even though it should have been 7.

## How to solve it

In some cases, you may want to ensure that a variable’s value is always read from the main memory, and not cached locally in a thread’s cache. This can be useful when dealing with **visibility issues** (not necessarily data races, but it can still be related).

```java
class Counter {
    private volatile int count;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

```

Or using Synchronization and locks, but this comes later

```java
class Counter {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized(lock) {
            count++;
        }
    }

    public int getCount() {
        synchronized(lock) {
            return count;
        }
    }
}

```

Now we will talk about more topics in multithreading using this youtube video https://www.youtube.com/watch?v=ddUSe3A9MMg. 

