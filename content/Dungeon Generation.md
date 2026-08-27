---
title: "Dungeon Generation using Binary Space Partitioning"
date: "2026-08-22"
category: "Computer Graphics"
description: "Generating a dungeon in OpenGL using Binary Space Paritioning"
---

# Binary Space Partitioning 

Binary Space Partitioning is implemented for recursively subdividing a space into two convex sets by using hyperplanes as partitions. This process of subdividing gives rise to the representation of objects within the space in the form of tree data structure known as BSP Tree. Binary space partitioning arose in the context of 3D computer graphics in 1969, where the structure of a BSP tree allows for spatial information about the objects in a scene that is useful in rendering, such as objects being ordered from front-to-back with respect to a viewer at a given location, to be accessed rapidly.

We will be using this technique for a game i started called "The reclaiming" It'sa game about dungeon crawling

Let's start with some simple class to define the generator class

```cpp
#include <vector>
int MINIMUM_ROOM_SIZE;
int MAX_ROOM_SIZE;

struct Partition {
    int x, y, width, height;
    Partition* left;
    Partition* right;

    Partition(int x, int y, int width, int height) : x(x), y(y), width(width), height(height), left(nullptr), right(nullptr) {}
};

class BinarySpacePartition {
    private:
        std::vector<std::vector<int>> space;

        void generateRooms(int width, int height){

        };

    public:
        BinarySpacePartition(int width, int height) {
            space.resize(height, std::vector<int>(width, 0));
        }

};

```

The algorithm is just about splitting a canvas multiple times until it's too small to split anymore, depending on our needs 
```c
void generateRooms(int width, int height){
if (width < MINIMUM_ROOM_SIZE * 2 &&
    height < MINIMUM_ROOM_SIZE * 2) {
    return;
}

```

then we simply pick a random index to split either vertically or horizontally, for each room

```c
 int idx = rand() % 2;
```
Finally the splitting logic 
```c
    int rdm = rand() % 2;
    if (rdm == 0) {
    // if width is greater than height, split vertically
        int split = rand() % (width - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
        generateRooms(split, height);
        generateRooms(width - split, height);
    } else {
    // if height is greater than width, split horizontally
        int split = rand() % (height - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
        generateRooms(width, split);
        generateRooms(width, height - split);
    }

```

the split decision is based on the minimum room size to make sure there is always enough space in a room for after splitting
and what happens is, suppose the minimum is 5 and the room is 20 units

XXXXXX[X]XXXXXXXXXXXXX

suppose a random number was 7, the condition would be
7 % 10 + 5 which evaluates to 12 so its fine, rand() could return any number so we need to limit it to the range that allows equal enough space on both ends

One issue with our current implementation that we are splitting based on size but we also need to keep the position in mind 

For now we have something like

```c
#include <vector>
int MINIMUM_ROOM_SIZE;
int MAX_ROOM_SIZE;

struct Partition {
    int x, y, width, height;
    Partition* left;
    Partition* right;

    Partition(int x, int y, int width, int height) : x(x), y(y), width(width), height(height), left(nullptr), right(nullptr) {}
};

class BinarySpacePartition {
    private:
        std::vector<std::vector<int>> space;

        void generateRooms(int width, int height){

            bool canSplitVertically = width >= MINIMUM_ROOM_SIZE * 2;
            bool canSplitHorizontally = height >= MINIMUM_ROOM_SIZE * 2;
            
            if (!canSplitVertically && !canSplitHorizontally) {
                return;
            }
            if (canSplitVertically && !canSplitHorizontally) {
                int split = rand() % (width - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
                generateRooms(split, height);
                generateRooms(width - split, height);
                return;
            } else if (!canSplitVertically && canSplitHorizontally) {
                int split = rand() % (height - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
                generateRooms(width, split);
                generateRooms(width, height - split);
                return;
            }
            else if (canSplitVertically && canSplitHorizontally) {
                // Both splits are possible, randomly choose one
                int rdm = rand() % 2;
                if (rdm == 0) {
                    // Split vertically
                    int split = rand() % (width - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
                    generateRooms(split, height);
                    generateRooms(width - split, height);
                } else {
                    // Split horizontally
                    int split = rand() % (height - MINIMUM_ROOM_SIZE * 2) + MINIMUM_ROOM_SIZE;
                    generateRooms(width, split);
                    generateRooms(width, height - split);
                }
            }

        };

    public:
        BinarySpacePartition(int width, int height) {
            space.resize(height, std::vector<int>(width, 0));
            generateRooms(width, height);
        }

};
```

Now let's make use of our struct `Partition` instead of using integers to represent size and position

we would start at the root here
```c
    BinarySpacePartition(int width, int height)
    {
        space.resize(height, std::vector<int>(width, 0));

        Partition* root = new Partition(
            0,
            0,
            width,
            height
        );

        generateRooms(root);
    }
```

and change the way we are splitting to
```c
        // Split vertically
        if (canSplitVertically && !canSplitHorizontally)
        {
            int split =
                rand() % (width - MINIMUM_ROOM_SIZE * 2)
                + MINIMUM_ROOM_SIZE;

            partition->left = new Partition(
                partition->x,
                partition->y,
                split,
                height
            );

            partition->right = new Partition(
                partition->x + split,
                partition->y,
                width - split,
                height
            );
        }
```

Running this we would get a room that looks like 
```
##################################################
#......##...##....##....##......##......##.......#
#......##...##....##....##......##......##.......#
#......##...##....##....##......##......##.......#
#......##...##....##....##########......##.......#
##################################......##.......#
##########################......##......##.......#
#......##...##....##....##......##################
#......##...##....##....##......##################
#......##...##....##....##......##......##.......#
#......##...##....##....##......##......##.......#
#......###########################......##.......#
#......###########################......##.......#
#......##.......##......##......##......##.......#
#########.......##......##......##......##.......#
#########.......##......##......##......##.......#
#......##.......##......##......##......##.......#
#......##.......##......##########################
#......##.......##......##########################
#......##.......##......##...##......##....##....#
##########################...##......##....##....#
##########################...##......##....##....#
#...##....##....##......##...##......##....##....#
#...##....##....##......##...##......##....#######
#...##....##....##......###############....#######
#############################################....#
##########################...##......########....#
#...##....##....##......##...##......##....##....#
#...##....##....##......##...##......##....##....#
#...##....##....##......##...##......##....##....#
#...##....##....##......##...##......##....##....#
##################################################
##################################################
#....##....##.....##....##.....##.....##...##....#
#....##....##.....##....##.....##.....##...##....#
#....##....##.....##....##.....##.....##...##....#
#....##....##.....##....#####################....#
#....##....##.....##....#####################....#
#....##....##.....##....##.....##.....##...#######
#....##....##.....########.....##.....##...#######
#....##....##.....########.....##.....##...##....#
####################....##.....##.....##...##....#
####################....#########.....#######....#
#......##...##....##....##########################
#......##...##....##....##.....#########...#######
#......##...##....##....##.....##.....##...##....#
#......##...##....##....##.....##.....##...##....#
#......##...##....##....##.....##.....##...##....#
#......##...##....##....##.....##.....##...##....#
##################################################
```

Where ... represents empty rooms, actually we can visualize it a little better 


![image.png](/images/paste-1787404193096-6c7b6b18b798103a.png)

Okay so now we need to make corridors between dungeon rooms so we can actually have a way to move between them, we define the center of each room and connect the space between it's left and right

```c
    void drawCorridor(Point p1, Point p2)
    {
        int x = p1.x;
        int y = p1.y;

        while (x != p2.x) {
            if (space[y][x] == 0) space[y][x] = -1;
            x += (p2.x > p1.x) ? 1 : -1;
        }
        while (y != p2.y) {
            if (space[y][x] == 0) space[y][x] = -1;
            y += (p2.y > p1.y) ? 1 : -1;
        }
        if (space[p2.y][p2.x] == 0) space[p2.y][p2.x] = -1;
    }

    void generateCorridors(Partition* partition)
    {
        if (partition == nullptr || (partition->left == nullptr && partition->right == nullptr))
            return;

        generateCorridors(partition->left);
        generateCorridors(partition->right);

        Point p1 = partition->left->getCenter();
        Point p2 = partition->right->getCenter();

        drawCorridor(p1, p2);
    }
```
we end up with this

![image.png](/images/paste-1787409212778-2aeb0687a7fb0fbc.png)

Now if we are going to turn this into a game we need to save some meta data
Let's create a level class

```cpp
class Level
{
private:
    int width;
    int height;

    std::vector<Room> rooms;
    BinarySpacePartition bsp;
    

public:
    Level(int width, int height)
        : width(width),
          height(height),
          rooms(),
          bsp(width, height, rooms)
    {
    }

```

The level class will be responsible for how to render the rooms, for this we need to store the vertices and indices in a mesh class to pass it to the GPU later

```cpp
#include "Mesh.h"

Mesh::Mesh(
    const std::vector<float>& vertices,
    const std::vector<unsigned int>& indices
)
    : vertices(vertices),
      indices(indices),
      VAO(),
      VBO(vertices.data(), vertices.size() * sizeof(float)),
      EBO(indices.data(), indices.size() * sizeof(unsigned int))
{
    VertexBufferLayout layout;

    layout.Push<float>(3);

    VAO.AddBuffer(VBO, layout);
}

void Mesh::Bind() const
{
    VAO.Bind();
    EBO.Bind();
}

void Mesh::Unbind() const
{
    EBO.Unbind();
    VAO.Unbind();
}

unsigned int Mesh::GetIndexCount() const
{
    return EBO.GetCount();
}

```

We store all quads for all walls,floors and corridoors and just render them in 3 calls separately


![image.png](/images/paste-1787832184392-6c3d95e7d5b317ea.png)

After adding a simple floor texture

![image.png](/images/paste-1787839016305-701fb80d5599311d.png)
