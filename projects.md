---
title: Projects
layout: collection
permalink: projects
---
# Branch Predictors FL Models

#### *[Find this project on GitHub](https://github.com/parthsaraswat/branch-pred-fl)* 
---

In computer architecture, a branch predictor is a digital circuit that tries to guess which way a branch(e.g. an if–then–else structure) will go before this is known definitively. The purpose of the branch predictor is to improve the flow in the instruction pipeline. Branch predictors play a critical role in achieving high effective performance in many modern pipelined microprocessor architectures.

![2-level BHT](https://i.ibb.co/TqKDsMC/Screen-Shot-2020-05-12-at-5-56-43-PM.png)

There are several methods to implement this branch prediction. This project includes functional level C++ models of 3 parameterized branch predictors: 

1. The 2-bit saturating counter
2. A 1-level BHT scheme
3. A 2-level BHT scheme.

This project also includes a Pintool (dynamic instrumentation tool) that can instrument binaries and measure the accuracy of different variations of the 3 predictor designs. 

---

