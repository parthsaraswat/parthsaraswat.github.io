---
title: "Medium Grain Sorting Accelerator"
layout: post
sub_title:
excerpt: 

image: 
  path: "/assets/images/projects/sort-xcel-header.jpg"
  thumbnail: "/assets/images/projects/sort-xcel.jpg"
  caption: "Sorting Accelerator amoeba plot"
actions:

  - label: "Download report"
    icon: pdf
    url: "/assets/pdfs/sort-xcel.pdf"
---

In this project, we worked to implement a medium-grain hardware accelerator for sorting a variable length integer array. The baseline design consists of a pure-software sorting microbenchmark, in which a quicksort algorithm is implemented. This program is run on a pipelined processor with its own instruction and data cache. The alternative design adds to the baseline design with a hardware accelerator and the necessary software to configure and assist the accelerator. The purpose of this project was to gain familiarity with implementing an accelerator, as well as getting experience with hardware/software codesign. In addition, the open-ended nature of the alternative design pushed us to think critically about what designs may yield the best area, energy and performance results. 

Finally, this project gave us some insight into how physically incorporating an accelerator into the design effects area, energy, and timing. In our alternative design, the accelerator loaded 8 integers from a provided source address, sorted the 8 integers, and wrote them back into the source address, like so: 

![example](/assets/images/projects/sort-xcel-ex.jpg)

It then repeated the process until the entire source array had been transformed into an array of multiple sorted blocks of 8 integers. The software then assisted the accelerator by merging the sorted blocks into the destination array. 

We were able to successfully complete the alternative design, and push everything through the ASIC toolflow. Based on the results gathered from pushing the designs through the flow, we found that when sorting a 128 integer array, the alternate composition provided 1.04x the performance of the baseline, while consuming 1.11x the amount of energy, and 1.04x the amount of area. We conclude that whether or not an accelerator is a good fit for a design is specific to the situation, however our results push us towards believing that the tradeoff between performance and energy/area from implementing the accelerator to not be worth it. We do however believe that this could change with further optimizations. Overall, the additional area overhead is expected because we are building an accelerator on top of the existing pmx composition. Therefore, to make the accelerator worthwhile, the focus of further work should be on reducing the energy overhead and increasing performance.