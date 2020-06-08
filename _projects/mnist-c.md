---
title: "Object Oriented MNIST Classifier in C++"
layout: post
sub_title:
excerpt: End-to-end, unit tested system built from scratch

image: 
  path: "/assets/images/projects/mnist-c.png"
  thumbnail: "/assets/images/projects/mnist-c.png"
  caption: "Flame graph"
actions:

  - label: "Download reports"
    icon: download
    url: "/assets/pdfs/mnist-c.zip"
---
In this project, I implemented, tested, and evaluated a system capable of classifying MNIST images using thoroughly unit-tested data structures and algorithms in C++.

I implemented templated List, Vector, Tree, and Table data structures to store and process information. I also wrote directed and random unit-tests for each of the subsystems to deploy a thoroughly tested handwriting recognition system. I then profiled the performance of the system using flamegraphs and applied optimizations to speed up execution 16 fold.

A key theme of this project is that no inbuilt libraries were used. This was done to build a better understanding of how data structures and algorithms work under the hood in C++. 

The zip file includes 4 reports from 4 sections of the project, as well as a testing strategy document that outlines my testing strategy throughout this project. 