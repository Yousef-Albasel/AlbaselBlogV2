---
title: "The Graphics Pipeline"
date: "2025-10-07"
category: "real time rendering"
description: ""
---
# The Graphics Pipeline Explained

Imagine you’re rendering a simple 3D cube. Sounds easy, right?
Well, behind that spinning cube lies a beautifully complex process called the graphics pipeline — the system that turns math and models into the glowing pixels on your screen.

Today, we’ll walk through that pipeline step by step, using our cube as the hero of the story.

## The Application Stage

Our journey begins before the GPU even gets involved — inside the CPU.
Here, the application stage acts as the brain of the operation.
It’s where the developer defines what happens in the scene:

Where the cube is placed

How the camera views it

What the lights are doing

And how the user interacts with it.

You can think of this stage as arranging your cube on a virtual set — setting up the camera, lights, and even physics.
For example, if your cube collides with a wall, the collision detection logic happens here. The CPU figures out what the response should be — maybe the cube bounces or stops — and sends that information forward.

Developers have full control over this stage. It’s pure software, and it runs on the CPU.
However, parts of it can also run on the GPU using compute shaders — these treat the GPU as a parallel processor, running general-purpose tasks that aren’t strictly about graphics.

This stage doesn’t have fixed sub-stages like later ones, but it can still run in parallel — multiple CPU cores can process multiple cubes or physics tasks simultaneously.
That’s what we call a superscalar construction — many processes running at once within the same stage.

This is also where acceleration algorithms like culling come in — for example, if the cube is behind the camera, there’s no need to send it down the pipeline at all.

Once everything is ready — positions, lights, input — the application sends draw calls to the GPU.
And that’s where it all begins.

## Geometry Processing

Now the cube has entered the GPU — the true engine of the graphics pipeline.
This stage handles all the math and transformations needed to turn 3D geometry into something that can eventually be drawn on screen.

Geometry processing is itself divided into multiple smaller stages:

Vertex shading

Projection

Clipping

Screen mapping

Let’s go step-by-step, following our cube through each transformation.

The vertex shader runs once for every corner — or vertex — of the cube.
Its main job is to determine where each vertex should appear in 3D space, and to compute any additional data, like normals or texture coordinates.

Traditionally, vertex shading also included lighting calculations — applying lights to each vertex to compute its color, and then interpolating those colors across each face.
But modern GPUs often defer lighting to later stages, so the vertex shader’s role is now more general: prepare all the data each vertex will need.

Let’s follow our cube through the coordinate spaces it travels:

Model Space – This is the cube’s local space, where it was originally modeled.

World Space – After applying the model transform, the cube is placed in the shared 3D world with other objects.

View Space (or Camera Space) – The view transform repositions everything so the camera is at the origin, looking down the negative z-axis. This simplifies projection later.

Clip Space – After applying a projection transform, the cube is fitted into a unit cube from (-1, -1, -1) to (1, 1, 1). This is called the canonical view volume.

Projection comes in two main types:

Orthographic projection, where parallel lines remain parallel — perfect for CAD tools or 2D games.

Perspective projection, where distant faces of the cube appear smaller, mimicking real-world depth.

Both are represented as 4×4 matrices, and the vertex shader applies these transformations to every vertex.

Once all transformations are applied, the cube’s vertices are expressed in homogeneous coordinates, ready for clipping.

## Optional Geometry Stages — “Adding Detail or Effects”

The GPU also has several optional stages that can modify or enhance geometry before rasterization.

Tessellation –
Let’s say your cube is far away — you don’t need much detail. But as you zoom in, you want smoother edges.
Tessellation dynamically subdivides surfaces, generating more triangles when needed, and fewer when not.
It does this using three mini-stages:

Hull shader

Tessellator

Domain shader
Together, they control how finely each face of the cube is divided.

Geometry Shader –
This stage can take a primitive — like one triangle from the cube — and create new geometry from it.
You could use it to generate particle effects, simulate sparks, or even duplicate the cube multiple times for a fireworks effect.

Stream Output –
Instead of continuing down the pipeline, the GPU can stop here and store processed vertices in memory.
This is useful for effects that require feedback, like particle systems where each cube or spark’s position is updated every frame.

Each of these optional stages adds flexibility — letting developers trade between performance and detail.

## Clipping
Now our cube has been projected into clip space, but not all of it may fit inside the camera’s field of view.
The clipping stage checks each triangle of the cube and removes or trims the parts that fall outside the visible region.

Because we’re working with homogeneous coordinates after projection, clipping ensures that even perspective-correct interpolation (like textures) remains accurate after trimming.

After clipping, the GPU performs perspective division — dividing by the W coordinate — which converts positions into normalized device coordinates, ready for the final mapping to the screen.

## Screen Mapping

At this point, only the visible parts of the cube remain.
The screen mapping stage converts those 3D coordinates into 2D screen positions — pixel coordinates on your display.

Here’s how it works:

The X and Y coordinates are scaled and translated to fit the screen’s width and height.

The Z coordinate — used for depth — is mapped to a range like [0, 1] in DirectX or [-1, 1] in OpenGL.

So if your cube is rendered inside a 1920×1080 window, every vertex’s 3D position becomes a precise pixel location.
This stage defines where the cube will actually appear in your frame.

The result of screen mapping — those transformed coordinates — is passed to the rasterizer, which turns them into pixels.
But that’s a story for another chapter.