---
title: "Branch Predictor FL models"
layout: post
sub_title: "Computer Architecture meets OOPs"
excerpt: "A comparative study"

image: 
  path: https://i.ibb.co/TqKDsMC/Screen-Shot-2020-05-12-at-5-56-43-PM.png
  thumbnail: https://i.ibb.co/TqKDsMC/Screen-Shot-2020-05-12-at-5-56-43-PM.png
  caption: "Photo from [Pexels](https://www.pexels.com)"
actions:
  - label: "GitHub"
    icon: github
    url: "https://github.com/parthsaraswat/branch-pred-fl"
  - label: "Download report"
    icon: pdf
    url: "/assets/pdfs/branch-pred-fl.pdf"
---
In computer architecture, a branch predictor is a digital circuit that tries to guess which way a branch (e.g. an if–then–else structure) will go before this is known definitively. The purpose of the branch predictor is to improve the flow in the instruction pipeline. Branch predictors play a critical role in achieving high effective performance in many modern pipelined microprocessor architectures.

There are several methods to implement this branch prediction. This project includes functional level C++ models of 3 parameterized branch predictors: 

1. The 2-bit saturating counter
2. A 1-level BHT scheme
3. A 2-level BHT scheme.

This project also includes a Pintool (dynamic instrumentation tool) that can instrument binaries and measure the accuracy of different variations of the 3 predictor designs. 

---
*This project is a starting point for a group project which involved the comparison of branch predictor ASICs in terms of area, energy, performance, and accuracy. The report for that project is available [here](/assets/pdfs/branch-pred-rtl.pdf)*.
