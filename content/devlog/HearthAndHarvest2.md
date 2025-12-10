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
How u calculate it is by finding the minimum overlap between all 3 axis. This way the character feels more stable, imagine 2 boxes, one on top of another, and you get the overlap for X and Y axis,
![image.png](/images/paste-1765376794257-4a920ba8e0201378.png)
X-axis overlap would be a lot bigger than y-overlap, we don't need to displace the box using X for this case.

```cpp
inline glm::vec3 GetPenetrationVector(const AABB& a, const AABB& b) {
    glm::vec3 penetration(0.0f);
    
    float xOverlap = glm::min(a.max.x, b.max.x) - glm::max(a.min.x, b.min.x);
    float yOverlap = glm::min(a.max.y, b.max.y) - glm::max(a.min.y, b.min.y);
    float zOverlap = glm::min(a.max.z, b.max.z) - glm::max(a.min.z, b.min.z);
    
    if (xOverlap < yOverlap && xOverlap < zOverlap) {
        penetration.x = (a.getCenter().x < b.getCenter().x) ? -xOverlap : xOverlap;
    } else if (yOverlap < zOverlap) {
        penetration.y = (a.getCenter().y < b.getCenter().y) ? -yOverlap : yOverlap;
    } else {
        penetration.z = (a.getCenter().z < b.getCenter().z) ? -zOverlap : zOverlap;
    }
    
    return penetration;
}
```


![image.png](/images/paste-1765375444138-2f6985cd26d2633f.png)


Now our character can walk and run on a platform and fall out of it. We also have added a mode that makes camera follow the player, we have enough components to start writing networking modules, we will do that next devlog.