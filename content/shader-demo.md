---
title: "GLSL Shader Demos"
description: "Live GLSL fragment shaders rendered in the browser with WebGL"
date: "2026-02-15"
category: "Computer Graphics"
image: "/images/opengl.jpg"
---

### Live GLSL Shader Rendering

Vertex supports rendering GLSL fragment shaders directly in your blog posts. The shaders run live in the browser using WebGL — no plugins, no iframes, fully static.

### Color Gradient

A simple animated color gradient using cosine-based palette generation:

```glsl-canvas
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(col, 1.0);
}
```

### Animated Circle SDF

A signed distance field circle with a glowing edge, animated over time:

```glsl-canvas
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    float radius = 0.3 + 0.05 * sin(u_time * 2.0);
    float d = length(uv) - radius;
    
    vec3 col = vec3(0.05);
    col += vec3(0.2, 0.5, 1.0) * (1.0 / (1.0 + abs(d) * 40.0));
    col += vec3(0.4, 0.8, 1.0) * smoothstep(0.005, 0.0, abs(d));
    
    gl_FragColor = vec4(col, 1.0);
}
```

### Mandelbrot Set

A classic fractal rendered entirely in a fragment shader:

```glsl-canvas
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    
    vec2 c = uv * 2.5 - vec2(0.5, 0.0);
    vec2 z = vec2(0.0);
    
    float iter = 0.0;
    const float maxIter = 100.0;
    
    for (float i = 0.0; i < 100.0; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (dot(z, z) > 4.0) break;
        iter++;
    }
    
    float t = iter / maxIter;
    vec3 col = 0.5 + 0.5 * cos(3.0 + t * 6.28 * 2.0 + vec3(0.0, 0.6, 1.0));
    if (iter >= maxIter - 1.0) col = vec3(0.0);
    
    gl_FragColor = vec4(col, 1.0);
}
```

### How It Works

To add a live shader to your post, use the `glsl-canvas` language tag on a code block:

````
```glsl-canvas
// Your GLSL fragment shader code here
```
````

Built-in uniforms available:
- **`u_resolution`** — canvas dimensions in pixels
- **`u_time`** — elapsed time in seconds
- **`u_mouse`** — mouse position (normalized 0-1, bottom-left origin)
