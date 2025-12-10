---
title: "Hearth and Harvest"
date: "2025-11-02"
category: "devlog"
description: ""
---

# Hearth and Harvest Devlog #1

Creating my own indie game has always been a dream of mine. Over the years, I’ve made several attempts, but none reached completion. This month, I’ve dedicated time to brainstorming and developing game concepts that balance challenging enough to be engaging, yet manageable and scalable.

One persistent frustration I’ve encountered is working with game engines. The steep learning curve of understanding engine workflows and mastering their tools often feels like busywork, offering little growth in terms of my actual programming or problem-solving skills.

For this reason, I’ve decided to take a more hands-on approach: building the game from scratch using C++ and OpenGL. While I’ve attempted this in the past without success, I’m ready to try again and see what happens.

## The Idea

I’ve had plenty of game ideas over the years, but they often fell into one of two traps: either too complex to realistically implement or too simplistic to be engaging. Recently, while playing Stardew Valley, an idea struck me. what if I created a 3D cooperative farming game?

In this game, you and your friends could manage a farm together, earn profits, and invest in upgrades, all while facing unique twists and challenges that keep things interesting. The primary goal, however, would remain simple: to have fun playing together, exploring activities, and enjoying the collaborative experience.

## Main Components of the game
Now that I have a solid game concept, there are a few key decisions to makestarting with the game mechanics, style, and technical approach.

I decided to tackle the character system first. One of the biggest challenges I’ve faced in creating playable characters is skeletal animation and the creative side of it. I have little experience with modeling or animation. In a previous project, a caveman game, I spent an overwhelming amount of time animating characters using Mixamo, importing animations, and tweaking them in the engine. The process was incredibly tedious.

An alternative approach is to construct characters from separate body parts and animate them using simple transformations. While this method limits the range and fluidity of animations, it is more than sufficient for my game. It also makes animation, texturing, and overall management far easier. This modular technique is similar to what games like Minecraft, Roblox, and other voxel-based games employ.

with some creativity we can create some unique and amazing characters.
Example on this style:


![image.png](/images/paste-1764776219690-f2f89d2c533855bd.png)

That also eliminates the hassle of importing models, keyframes  managing all that. 

## Coding it

I've reused a lot of abstractions and components from my Terrain generation engine, they are not enough but a good project start, that gave me camera controls, rendering abstraction and IMGUI debugging. Next i worked on the character creation.

I will have each body part rendered separately using its own Vertex buffers and element buffers. set a parent for each body part and a pivot point to be able to rotate around
```cpp
struct BodyPart{
    Mesh mesh;
    glm::vec3 position;
    glm::vec3 rotation;
    glm::vec3 pivotPoint;
    glm::vec3 scale;
    BodyPart* parent;
        BodyPart() : position(0.0f), rotation(0.0f), pivotPoint(0.0f), 
        scale(1.0f), parent(nullptr) {}
};
```
Then i create 16 different body part representing my character, i don't intend to make the character look that simple maybe i will edit the mesh for these body parts later but for now i'm sticking with that simple rectangular cubic body shape.

the choice of making 16 body parts is just to balance not being too similar to minecraft and roblox and not too complex to animate.. 

![image.png](/images/paste-1764776601286-76ace941641367bd.png)

Next i create a character class, link each body part together by defining a parent body part and a pivot point to rotate around, this usually is picked with trial and error and some standards like having thighs rotate around pelvis and arm rotates around shoulder, then animating using simple sine and cosine wave functions

```cpp
void Character::AnimateWalk() {
    float walkCycle = sin(animationTime * 5.0f);
    
    // Arm swing
    leftUpperArm.rotation.x = walkCycle * 0.5f;
    rightUpperArm.rotation.x = -walkCycle * 0.5f;
    
    // Leg movement
    leftThigh.rotation.x = -walkCycle * 0.4f;
    rightThigh.rotation.x = walkCycle * 0.4f;
    
    // Knee bend
    leftShin.rotation.x = glm::max(0.0f, -walkCycle * 0.3f);
    rightShin.rotation.x = glm::max(0.0f, walkCycle * 0.3f);
    
    pelvis.position.y = abs(sin(animationTime * 10.0f)) * 0.05f;
}
```

I ended up with this

![Screenshot 2025-12-03 163748.png](/images/paste-1764777062834-da119966fafdba70.png)



It looks chunky but iam kinda happy with it, in future i will have to wrap some textures around it and possible play with the mesh or possible make it interact with the environment procedurally but for now that will do.