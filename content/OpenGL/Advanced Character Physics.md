---
title: "Advanced Character Physics"
date: "2026-11-08"
category: "Computer Graphics"
description: "Implementing Thomas Jakobsen's paper `Advanced Character Physics` for Hitman's first game ragdoll death animation"
---

# Advanced Character Physics

-- This paper explains the basic elements of an approach to physically-based
modeling which is well suited for interactive use. It is simple, fast, and quite
stable, and in its basic version the method does not require knowledge of
advanced mathematical subjects (although it is based on a solid mathematical
foundation). It allows for simulation of both cloth; soft and rigid bodies; and
even articulated or constrained bodies using both forward and inverse
kinematics. -- 

So i came into this paper a while ago and i've always wanted to build a ragdoll physics engine from scratch and i do think this is a very good introductory paper on this subject despite having "Advanced" in the title 

![image.png](/images/paste-1794170594578-a3ff89ad15cef80d.png)

imagine you are a hitman developer around the year 2000, and you are asked to build a ragdoll system so when you kill someone they fall naturally. 

there are ways you can model this accurately enough but these were not computationally efficient for the computer at this time 

So Thomas made a choice, the scene should be believable rather than accurate 
A physically imperfect result can be perfectly acceptable if the player doesn't notice the difference.

For this solution we are using a constraing solving algorithm that can be stopped after a number of iterations.
You could spend a lot of computation trying to satisfy every constraint as accurately as possible.
But Jakobsen's approach allows you to stop early and accept a small amount of error.

