(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{776:function(e,t,a){"use strict";a.r(t);var n=a(95),s=a(96),r=a(98),i=a(97),l=a(99),o=a(1),w=a.n(o),d=a(253),c=a(554),D=a.n(c),p=a(258),m=a.n(p),h=(a(627),a(103)),u=a(1211);Object(h.a)();D.a.setLocalizer(D.a.momentLocalizer(m.a));var v=new Date,y=v.getFullYear(),E=v.getMonth(),g=[{title:"All Day Event very long title",allDay:!0,start:new Date(y,E,0),end:new Date(y,E,1)},{title:"Long Event",start:new Date(y,E,7),end:new Date(y,E,10)},{title:"DTS STARTS",start:new Date(y+1,2,13,0,0,0),end:new Date(y+1,2,20,0,0,0)},{title:"DTS ENDS",start:new Date(y+1,10,6,0,0,0),end:new Date(y+1,10,13,0,0,0)},{title:"Some Event",start:new Date(y,E,9,0,0,0),end:new Date(y,E,9,0,0,0)},{title:"Conference",start:new Date(y,E,11),end:new Date(y,E,13),desc:"Big conference for important people"},{title:"Meeting",start:new Date(y,E,12,10,30,0,0),end:new Date(y,E,12,12,30,0,0),desc:"Pre-meeting meeting, to prepare for the meeting"},{title:"Lunch",start:new Date(y,E,12,12,0,0,0),end:new Date(y,E,12,13,0,0,0),desc:"Power lunch"},{title:"Meeting",start:new Date(y,E,12,14,0,0,0),end:new Date(y,E,12,15,0,0,0)},{title:"Happy Hour",start:new Date(y,E,12,17,0,0,0),end:new Date(y,E,12,17,30,0,0),desc:"Most important meal of the day"},{title:"Dinner",start:new Date(y,E,12,20,0,0,0),end:new Date(y,E,12,21,0,0,0)},{title:"Birthday Party",start:new Date(y,E,13,7,0,0),end:new Date(y,E,13,10,30,0)},{title:"Birthday Party 2",start:new Date(y,E,13,7,0,0),end:new Date(y,E,13,10,30,0)},{title:"Birthday Party 3",start:new Date(y,E,13,7,0,0),end:new Date(y,E,13,10,30,0)},{title:"Late Night Event",start:new Date(y,E,17,19,30,0),end:new Date(y,E,18,2,0,0)},{title:"Multi-day Event",start:new Date(y,E,20,19,30,0),end:new Date(y,E,22,2,0,0)}],b=function(e){function t(){return Object(n.a)(this,t),Object(r.a)(this,Object(i.a)(t).apply(this,arguments))}return Object(l.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this;return w.a.createElement("div",{className:"animated"},w.a.createElement(d.i,null,w.a.createElement(d.n,null,w.a.createElement("i",{className:"icon-calendar"}),"Calendar"," "),console.log("PROP",this.props.events),w.a.createElement(d.j,{style:{height:"40em"}},w.a.createElement(D.a,Object.assign({className:"d-sm-down-none"},this.props,{events:this.props.events||g,views:["month","week","day"],step:30,defaultDate:new Date(y,E,1),defaultView:"month",toolbar:!0,onSelectEvent:function(t){console.log("SELECTED",t),e.props.history.push("/jobs/"+t.jobId)}})),w.a.createElement(D.a,Object.assign({className:"d-md-none"},this.props,{events:this.props.events||g,views:["day"],step:30,defaultDate:new Date(y,E,1),defaultView:"day",toolbar:!0})))))}}]),t}(o.Component);t.default=Object(u.a)(b)}}]);
//# sourceMappingURL=28.0cd018a4.chunk.js.map