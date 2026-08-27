---
title: "Normal Mapping"
date: "2026-08-27"
category: "Computer Graphics"
description: "Applying normal mapping to our dungeon floors"
image: "/images/paste-1787841931192-1b04e3983270050e.jpg"
---

# Normal Mapping

We applied a simple specular light and texture to our floor in the previous post 

![image.png](/images/paste-1787842049504-46e9bb7666936f06.png)

today, i will try to implement normal mapping to that floor and see if we could make it look any better 

The way that normal mapping works, in other lighting models we calculate the light value of a pixel based on the angle between the reversed light direction and the normal, and since the normal is always pointing upward, 
![image.png](/images/paste-1787845388936-9b8eb8e1d58950a4.png)

the same lighting calculation will be done on the both the top of the tile and the edges, we as humans expect the edges to be darker because it's a little deeper into the ground 
![image.png](/images/paste-1787845478465-dfc979ef35c45a9f.png)

we solve this be defining where each normal should be located per pixel


We then simply map each pixel with it's corresponding value in the normal map

the changes are really easy to do, we load the texture, bind it
```cpp
        floorTexture->Bind();
        floorNormalTexture->Bind(1);
        floorShader->SetUniform1i("u_Texture", 0);
        floorShader->SetUniform1i("normalMap", 1);
        
```
After that we modify the shader to use that normal instead of the one we are reading from the vertices list

```glsl
    vec3 tangentNormal = texture(normalMap, v_TexCoord).rgb;

    // Convert [0, 1] -> [-1, 1]
    tangentNormal = tangentNormal * 2.0 - 1.0;
    tangentNormal.xy *= 2.0;

    tangentNormal = normalize(tangentNormal);

```
The issue is, A normal map doesn't normally store normals in world space.

The RGB values represent a normal in tangent space.

For example, a typical normal-map pixel might decode to:

tangentNormal = vec3(0.5, 0.5, 1.0);

That basically means:

"The surface normal points mostly straight out of the surface."

But what does "out of the surface" mean?

That's where T, B, and N come in.

since it's a floor, it's always gonna be facing upwards, so we can cheat this and define the transformation matrix like this

```glsl

    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 0.0, 1.0);
    vec3 N = vec3(0.0, 1.0, 0.0);

    mat3 TBN = mat3(T, B, N);

    // Convert tangent-space normal -> world space
    vec3 worldNormal = normalize(TBN * tangentNormal);
```


### Before Normal Mapping


![image.png](/images/paste-1787847695974-e60988c6e454b983.png)


![image.png](/images/paste-1787847731634-13a6dfd0ad188b76.png)

### After Normal Mapping


![image.png](/images/paste-1787848442378-0c349d34280fc18e.png)

![image.png](/images/paste-1787848471981-ec0e8b1c3e2005e1.png)

![image.png](/images/paste-1787848492056-59a0fb3bd5fdf7b6.png)

ok this is insanely better.. i didn't expect it to be that good tbh.. i will replicate the same setup for the walls

