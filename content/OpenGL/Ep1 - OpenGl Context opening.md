---
title: "Ep1   OpenGl Context opening"
date: "2026-10-03"
category: ""
description: ""
---

# Ep1 - OpenGl Context opening

these are notes for episode one of the OpenGL series for making a multiplayer game from scratch

Let's start by downloading the files we need, i 

## GLFW setup

- Go to https://www.glfw.org/download
- Download the binaries for your target system, in this tutorial we are going to use Windows 64-bit binary
- place it inside a folder in our project and extract


![image.png](/images/paste-1791034770017-f4c96c6907f226ad.png)

keep only include folder and the library folder for our compiler, iam using MSVC, Visual Studio 2022 complier 


![image.png](/images/paste-1791034855750-78478871012ae8de.png)


Now create a main.cpp file and let's make a window context for our game

```cpp
#include <GLFW/glfw3.h>

int main(){

    GLFWwindow* window;

    if (!glfwInit())
        return -1;
    window = glfwCreateWindow(1280,720,"Hello World",NULL,NULL);

    if (!window){
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);
    
    while (!glfwWindowShouldClose(window))
    {
        glClear(GL_COLOR_BUFFER_BIT);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;

}
```
Now this won't work if we try to compile the file and run it we need to build the code against the glfw library

```
cmake_minimum_required(VERSION 3.15)
project(GAME)
```
"This project requires at least CMake 3.15."

```
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
```
```
add_executable(${PROJECT_NAME} src/main.cpp)
```
"Create an executable target called GAME, and its source code is src/main.cpp."


```
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/dep/glfw/include
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/dep/glfw/lib-vc2022/glfw3.lib
    opengl32
    User32
    Gdi32
    Shell32
)

```
```
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
```

This modifies properties of your:

GAME

target.

You're telling CMake:

"Put the generated executable in this directory."

now navigate to folder build and run
run 
`cmake ..`

then 
`cmake --build .`
after it finishes you can open the window inside build/bin/debut/GAME.exe

now that we are done with GLFW we need to install GLEW from https://glew.sourceforge.net/

then choose download binaries 

Now same steps, keep only the lib and include folders, then add it to the cmakelists file

```
cmake_minimum_required(VERSION 3.15)
project(GAME)

set(CMAKE_CXX_STANDARD 17)

add_executable(${PROJECT_NAME} src/main.cpp)

target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/dep/glfw/include
    ${CMAKE_SOURCE_DIR}/dep/glew/include
)

target_link_libraries(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/dep/glfw/lib-vc2022/glfw3.lib
    ${CMAKE_SOURCE_DIR}/dep/glew/lib/Release/x64/glew32s.lib
    opengl32
    User32
    Gdi32
    Shell32
)

set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
```

then in your main.cpp file add the glew initialization line
also you need to remember to have glew above glfw and use #define glew_static since we are using the static version 
```c
#define GLEW_STATIC
#include <GL/glew.h>
#include <GLFW/glfw3.h>
```
We initialize glew after having initialized our window context 
```cpp
#define GLEW_STATIC

#include <GL/glew.h>
#include <GLFW/glfw3.h>

int main()
{
    GLFWwindow* window;

    if (!glfwInit())
        return -1;

    window = glfwCreateWindow(1280, 720, "Hello World", NULL, NULL);

    if (!window)
    {
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);

    // Initialize GLEW
    GLenum err = glewInit();

    if (err != GLEW_OK)
    {
        glfwTerminate();
        return -1;
    }

    while (!glfwWindowShouldClose(window))
    {
        glClear(GL_COLOR_BUFFER_BIT);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}
```

one last thing to keep it clean we can move the #define GL_STATIC to the CMake file 

```
add_definitions(-DGLEW_STATIC)
```

Now that GLFW creates our window and GLEW gives us access to OpenGL functions, let's actually make something happen on screen.

Right now our render loop only clears the screen to the default OpenGL clear color.

We can change that using:
`
glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
`

Place this after glewInit() succeeds and before the main loop:
`
if (err != GLEW_OK)
{
    glfwTerminate();
    return -1;
}
`
`
glClearColor(0.1f, 0.1f, 0.1f, 1.0f);

while (!glfwWindowShouldClose(window))
`

The four values represent:

red
green
blue
alpha

So:
`
glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
`

means:

Clear the screen with a dark gray color and full opacity.

And because we call:
`
glClear(GL_COLOR_BUFFER_BIT);
`
inside the loop, every frame gets cleared using this color.

Let's make the color move

A static color is not particularly exciting.

GLFW provides a function called:
`
glfwGetTime()
`
which returns the amount of time, in seconds, since GLFW was initialized.

For example, we can do:
`
double time = glfwGetTime();
`
and use that value to change the color over time.

Let's replace our static glClearColor with this.

Inside the main loop:
`
while (!glfwWindowShouldClose(window))
{
    double time = glfwGetTime();

    float red = (float)(sin(time) * 0.5 + 0.5);

    glClearColor(red, 0.1f, 0.2f, 1.0f);

    glClear(GL_COLOR_BUFFER_BIT);

    glfwSwapBuffers(window);
    glfwPollEvents();
}
`
We are using:

sin(time)

to produce a smooth oscillating value.

The problem is that sin() produces values between:

-1 → 1

but colors need values between:

0 → 1

So:

sin(time) * 0.5 + 0.5

converts:

-1 → 1

into:

0 → 1

The result is a smoothly pulsing red channel.

Don't forget to include the math library at the top:

`
#include <cmath>
`
So your includes become:
`
#define GLEW_STATIC

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <cmath>
`
Now the entire program is:
```cpp
#define GLEW_STATIC

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <cmath>

int main()
{
    GLFWwindow* window;

    if (!glfwInit())
        return -1;

    window = glfwCreateWindow(1280, 720, "Hello World", NULL, NULL);

    if (!window)
    {
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);

    GLenum err = glewInit();

    if (err != GLEW_OK)
    {
        glfwTerminate();
        return -1;
    }

    while (!glfwWindowShouldClose(window))
    {
        double time = glfwGetTime();

        float red = (float)(sin(time) * 0.5 + 0.5);

        glClearColor(red, 0.1f, 0.2f, 1.0f);

        glClear(GL_COLOR_BUFFER_BIT);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}
```
Now we actually have animation.

Let's make all three colors move

We can make the effect a little more interesting by giving each color channel a different phase.

Change:
```
float red = (float)(sin(time) * 0.5 + 0.5);

glClearColor(red, 0.1f, 0.2f, 1.0f);
```
to:
```
float red   = (float)(sin(time) * 0.5 + 0.5);
float green = (float)(sin(time + 2.0) * 0.5 + 0.5);
float blue  = (float)(sin(time + 4.0) * 0.5 + 0.5);

glClearColor(red, green, blue, 1.0f);
```
The important part is:
```
sin(time + 2.0)
```
and:
```
sin(time + 4.0)
```

We're shifting the different waves in time.

This produces a continuously changing color rather than simply fading from one color to another.

## But what is delta time?

Now we have another important concept that we'll need for the actual game.

glfwGetTime() tells us:

How much time has passed since GLFW started.

But sometimes we don't care about the total elapsed time.

We care about:

How much time passed between this frame and the previous frame?

That's delta time.

For example:

Frame 1

Frame 2

    ↑

0.016 seconds



Frame 3

    ↑

0.017 seconds


We can calculate it ourselves.

Before the game loop, add:

double lastTime = glfwGetTime();

So:

double lastTime = glfwGetTime();

while (!glfwWindowShouldClose(window))
{

Then at the beginning of the loop:

double currentTime = glfwGetTime();

double deltaTime = currentTime - lastTime;

lastTime = currentTime;

So now:
```c
double lastTime = glfwGetTime();

while (!glfwWindowShouldClose(window))
{
    double currentTime = glfwGetTime();

    double deltaTime = currentTime - lastTime;

    lastTime = currentTime;

    // rendering...
}
```

deltaTime represents the amount of time that passed since the previous frame.

Why do we care about delta time?

Imagine we want to move something at:

100 pixels per second

A bad approach would be:

position += 100;

every frame.

At 60 FPS:

100 × 60 = 6000 pixels/second

At 144 FPS:

100 × 144 = 14400 pixels/second

The game would literally run faster on a faster computer.

Instead we multiply movement by delta time:

position += speed * deltaTime;

At 60 FPS:

100 × 0.016 ≈ 1.6 pixels

At 144 FPS:

100 × 0.0069 ≈ 0.69 pixels

But over one second, both move approximately:

100 pixels

That's the foundation of frame-rate-independent movement.

Let's use delta time for something visible

We don't have a triangle yet, so let's use it to control the color animation.

Instead of directly using:

sin(time)

we can maintain our own animation variable.

Before the loop:

float animationTime = 0.0f;

Then inside the loop:

animationTime += (float)deltaTime;

Now use:

float red = sin(animationTime) * 0.5f + 0.5f;

This means our animation advances according to actual elapsed time.

Add keyboard input

Now lets make the window react to us.

GLFW gives us:
```
glfwGetKey()
```
For example:
```
if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
{
    glfwSetWindowShouldClose(window, true);
}
```
Put this inside the game loop:
```
while (!glfwWindowShouldClose(window))
{
    double currentTime = glfwGetTime();

    double deltaTime = currentTime - lastTime;

    lastTime = currentTime;

    animationTime += (float)deltaTime;

    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
    {
        glfwSetWindowShouldClose(window, true);
    }

    // ...
}
```


There is one more important GLFW concept worth introducing in this episode.

If the player resizes the window, OpenGL needs to know what part of the window it should render to.

We can tell OpenGL the viewport size using:

glViewport()

Initially, after creating the context, add:

glViewport(0, 0, 1280, 720);

So:
```
glfwMakeContextCurrent(window);

GLenum err = glewInit();

if (err != GLEW_OK)
{
    glfwTerminate();
    return -1;
}

glViewport(0, 0, 1280, 720);
```
But hardcoding the dimensions isn't ideal.

GLFW can tell us the actual framebuffer size:
```
int width;
int height;

glfwGetFramebufferSize(window, &width, &height);

glViewport(0, 0, width, height);
```
We can do this every frame:
```
int width;
int height;

glfwGetFramebufferSize(window, &width, &height);

glViewport(0, 0, width, height);
```
Place it inside the loop before rendering.

Later, we'll replace this with a proper GLFW framebuffer-size callback.


```c
#define GLEW_STATIC

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <cmath>

int main()
{
    GLFWwindow* window;

    // Initialize GLFW
    if (!glfwInit())
        return -1;

    // Create the window
    window = glfwCreateWindow(
        1280,
        720,
        "OpenGL Game",
        NULL,
        NULL
    );

    if (!window)
    {
        glfwTerminate();
        return -1;
    }

    // Create the OpenGL context
    glfwMakeContextCurrent(window);

    // Initialize GLEW
    GLenum err = glewInit();

    if (err != GLEW_OK)
    {
        glfwTerminate();
        return -1;
    }

    // Timing
    double lastTime = glfwGetTime();

    float animationTime = 0.0f;
    float animationSpeed = 1.0f;

    // Main game loop
    while (!glfwWindowShouldClose(window))
    {
        // Calculate delta time
        double currentTime = glfwGetTime();

        double deltaTime = currentTime - lastTime;

        lastTime = currentTime;

        // Update animation
        animationTime += animationSpeed * (float)deltaTime;

        // Keyboard input
        if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        {
            glfwSetWindowShouldClose(window, true);
        }

        if (glfwGetKey(window, GLFW_KEY_UP) == GLFW_PRESS)
        {
            animationSpeed += 1.0f * (float)deltaTime;
        }

        if (glfwGetKey(window, GLFW_KEY_DOWN) == GLFW_PRESS)
        {
            animationSpeed -= 1.0f * (float)deltaTime;
        }

        if (animationSpeed < 0.1f)
        {
            animationSpeed = 0.1f;
        }

        // Get framebuffer size
        int width;
        int height;

        glfwGetFramebufferSize(window, &width, &height);

        glViewport(0, 0, width, height);

        // Calculate animated colors
        float red =
            (float)(sin(animationTime) * 0.5 + 0.5);

        float green =
            (float)(sin(animationTime + 2.0) * 0.5 + 0.5);

        float blue =
            (float)(sin(animationTime + 4.0) * 0.5 + 0.5);

        // Clear screen
        glClearColor(red, green, blue, 1.0f);

        glClear(GL_COLOR_BUFFER_BIT);

        // Present frame
        glfwSwapBuffers(window);

        // Process keyboard/window events
        glfwPollEvents();
    }

    glfwTerminate();

    return 0;
}
```