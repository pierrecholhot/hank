> Basic OS monitoring UI built on top of HighCharts.js

## Developer Background
Senior FE web developer in a major web agency in Paris for the past 5 years. Not a "graph expert".

## Current tech stack
- node.js
- express.js
- os-monitor
- socket.io
- highcharts.js

## My technical choices !== My technical skills
One of the things that distinguish experienced Front-End developers from others, is their ability to correctly assert certain needs for projects.
That being said, I won't use X or Z just because I know how to use them.

### react.js
React is fun, I will probably find a good use for it in most of my future projects.
But we are smart people, right? Do we really need React? How will React help us on this specific task?
IMHO, React is mainly for -out of the box- good performance, re-usable components and for "easier" maintenance.

I couldn't see a fit for React here. I saw it [on this project](https://github.com/pierrecholhot/auchan) and [there] =)

### highcharts VS d3
Simplicity VS Robustness.  
Since this project has a really "tiny" scope, I also felt that D3 would be an overkill here.
AFAIK, D3 would be a nice base for building "complex" dashboards with lots of graphs.
For this specific task, I decided that I would use Highcharts.js for the sake of -again- simplicity.
I never worked on live graphs before ; D3 learning curve worried me at a first glance. I would have gave it another shot if I could have allocated more time for this task.
And hey, Highcharts update method is quite easy-to-use compared to D3 update patterns =)

### node.js
Node is a non-negotiable dependency when developing a project. We know javascript and we should leverage this.  
I personally can't stand the idea of people who still use MAMP.  
And yes, sometimes, python's `simpleHTTPserver` can do the job when working on static pages.

### os-monitor
I am a big fan of "using what's already available out there".
I could have `exec('uptime')` in a `setInterval`, but well, someone already did that for us.

### socket.io
IMHO, its our best choice for simple Realtime communication between a Client and a Server.

### Stress test.
I needed to find a way to "stress test" the OS in order to test my alerting system.
I couldn't find any NPM packages that would help me accomplish this. Maybe I wasn't using the right keywords.
I then stackoverflow'd it and ended up with a one-liner shell cmd (`cat /dev/zero > /dev/null`). I have no idea what side effects it has and would never do that in a production env.

## That technical test
I couldn't help noticing that there were a bunch of os monitoring scripts on github. Mainly made by developers for this specific interview question.

It was interesting seeing these different approaches.

https://github.com/mattgrannary/wd-monitor  
https://github.com/kennethdavidbuck/snoopdog  
https://github.com/tyleraadams/load_monitoring  
https://github.com/atneik/Load-Monitor  
https://github.com/brettimus/goat-monitoring-app  
https://github.com/roadhomegames/load_monitor  

and much more..

## made by
pierre.cx
