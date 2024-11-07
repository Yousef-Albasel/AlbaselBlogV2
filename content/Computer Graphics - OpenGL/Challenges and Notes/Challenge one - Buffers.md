---
title: "Challenge One   Buffers"
date: 2024-01-30T22:26:53+02:00
draft: false
---

### Challenge One - Buffers

This is a challenge taken from the **GamesWithGabe** channel, focusing on rendering simple triangles and creating/managing buffers.

It comprises four mini-challenges:

**First:** Draw a square on the screen using `glDrawArrays.` Remember to store your vertex positions in normalized device coordinates, ranging from -1 to 1 in the **x** and **y** directions.

**Second:** Draw a square on the screen using `glDrawElements`.

**Third:** Draw a star using `glDrawElements`.

**Fourth:** Draw the outline of a square using the `GL_LINES` primitive.

**Fifth:** Repeat the star challenge, but utilize the named buffer technique we just discussed.

To be honest, I'm not interested in the fifth challenge because it relies on a function introduced only in **GL4**, and not all devices may support it. So, I'll focus on the other challenges

-------

#### First Challenge Solution

Here is the code for the first challenge without all the hassle of creating windows and shaders etc..

```cpp
    // The Current Challenge is: Draw a square on the screen using glDrawArrays. Remember to store your vertex positions in normalized device coordinates, ranging from -1 to 1 in the x and y directions

    // First let's create our vertices

    float vertices[] = {
             -0.5f, -0.5f,
              0.5f,-0.5f,
              0.5f, 0.5f,
              
              0.5f, 0.5f,
             -0.5f, 0.5f,
             - 0.5f, -0.5f
    };

    // Next let's create a VAO to bind our buffer with

    uint32_t VAO;
    glGenVertexArrays(1, &VAO);
    glBindVertexArray (VAO);

    // Now that we have our VAO, we can create a buffer to store these vertices in.

    uint32_t VBO;
    glGenBuffers(1, &VBO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    
    // Now let's copy the data in our vertices array to the buffer
    glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), vertices, GL_STATIC_DRAW);

    // But sadly, our GPU doesn't know how our data stored in the buffer.. :( 
    // we need to specify it for him, using attrib pointers

    glEnableVertexAttribArray(0); // Enabling location 1 in the vertex array 
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)0);

    // Creating simple shader to use ( we don't need to worry about it atm so i will not include it in the blog.
```


#### Second Challenge Solution

This one pretty easy, all we have to do is to get rid of redundunt data, create index buffer, bind it and copy data, finally draw elements.

```c
 // Now for Challenge Two, we need to create index buffer so we can save more data !
    unsigned int indices[]{
        0,1,2,
        2,3,0
    };

    // Creating the element buffer

    uint32_t EBO;
    glGenBuffers(1, &EBO);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, 6*sizeof(unsigned int), indices, GL_STATIC_DRAW);
```

inside main loop:
```c
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, NULL);
```

----

#### Third Challenge 
