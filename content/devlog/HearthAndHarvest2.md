---
title: "Hearth and Harvest"
date: "2025-11-02"
category: "devlog"
description: ""
---

# Hearth and Harvest Devlog #2

For this devlog, we will introduce more animations, and AABB Testing.

AABB Testing is just when you have 2 Rectangle and you want to test if they collide with eachother, It's the simplest collision detection algorithm used by many games, an alternative to it is SAT testing, which works with non-convex shapes.

![image.png](/images/paste-1765374877467-33b18567d563986d.png)

also one adventage of SAT over AABB is that u can detect rotated objects, AABB testing is literally Axis-Aligned bounding boxes, which is "AXIS-ALIGNED"

For starting we will implement AABB, and if we need to optimize to SAT we can do it later.

AABB is so simple that all you need to do is to give an object aabb attribute then check if the 2 AABBs collide with each other

```cpp
struct AABB {
    glm::vec3 min;
    glm::vec3 max;
    
    AABB() : min(0.0f), max(0.0f) {}
    AABB(const glm::vec3& min, const glm::vec3& max) : min(min), max(max) {}
    
    glm::vec3 getCenter() const {
        return (min + max) * 0.5f;
    }
    
    glm::vec3 getSize() const {
        return max - min;
    }
    
    void setCenter(const glm::vec3& center) {
        glm::vec3 halfSize = getSize() * 0.5f;
        min = center - halfSize;
        max = center + halfSize;
    }
};
```

```cpp
inline bool CheckAABBCollision(const AABB& a, const AABB& b) {
    return (a.min.x <= b.max.x && a.max.x >= b.min.x) &&
           (a.min.y <= b.max.y && a.max.y >= b.min.y) &&
           (a.min.z <= b.max.z && a.max.z >= b.min.z);
}
```
Then for each object we define aabbsize which will be the bounding box for this object
```cpp
    // Collision
    AABB aabb;
    glm::vec3 aabbSize;
```

Finally you check for collisions each frame, you also check for penetration


penetration is literally how much two objects are inside each other.
(Not in a weird way… Chill.)

`glm::vec3 GetPenetrationVector(const AABB& a, const AABB& b)`
This is useful so you don't get a character literally inside another object, this will push the character outside it