(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{1225:function(e,a,l){"use strict";l.r(a);var t=l(95),n=l(96),r=l(98),s=l(97),o=l(99),c=l(101),i=l(1),u=l.n(i),m=l(253),d=l(1212),b=(l(904),l(930)),v=(l(963),l(965),l(967)),E=l.n(v),p=l(968),h=(l(970),E.a.US),N=function(e){function a(e){var l;return Object(t.a)(this,a),(l=Object(r.a)(this,Object(s.a)(a).call(this,e))).saveChanges=l.saveChanges.bind(Object(c.a)(Object(c.a)(l))),l.updateDimensions=l.updateDimensions.bind(Object(c.a)(Object(c.a)(l))),l.state={value:["UT","OH"],windowWidth:window.innerWidth,orientation:"vertical",openDirection:"down"},l}return Object(o.a)(a,e),Object(n.a)(a,[{key:"componentDidMount",value:function(){this.updateDimensions(),window.addEventListener("resize",this.updateDimensions)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.updateDimensions)}},{key:"saveChanges",value:function(e){this.setState({value:e})}},{key:"updateDimensions",value:function(){var e=window.innerWidth;this.setState(function(a){return{windowWidth:e,orientation:e<620?"vertical":"horizontal",openDirection:e<620?"up":"down"}})}},{key:"render",value:function(){var e=this;return u.a.createElement("div",{className:"animated fadeIn"},u.a.createElement(m.hb,null,u.a.createElement(m.t,{sm:12,md:6,style:{flexBasis:"auto"}},u.a.createElement(m.i,null,u.a.createElement(m.n,null,u.a.createElement("i",{className:"icon-note"}),u.a.createElement("strong",null,"Masked Input")," ",u.a.createElement("small",null,"React Text Mask")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component")),u.a.createElement(m.j,null,u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Date input"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-calendar"}))),u.a.createElement(d.b,{mask:[/\d/,/\d/,"/",/\d/,/\d/,"/",/\d/,/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. 99/99/9999")),u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Phone input"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-phone"}))),u.a.createElement(d.b,{mask:["(",/[1-9]/,/\d/,/\d/,")"," ",/\d/,/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. (999) 999-9999")),u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Taxpayer Identification Numbers"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-usd"}))),u.a.createElement(d.b,{mask:[/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. 99-9999999")),u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Social Security Number"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-male"}))),u.a.createElement(d.b,{mask:[/\d/,/\d/,/\d/,"-",/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. 999-99-9999")),u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Eye Script"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-asterisk"}))),u.a.createElement(d.b,{mask:["~",/\d/,".",/\d/,/\d/," ","~",/\d/,".",/\d/,/\d/," ",/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. ~9.99 ~9.99 999")),u.a.createElement(m.E,null,u.a.createElement(m.L,null,"Credit Card Number"),u.a.createElement(m.H,null,u.a.createElement(m.I,{addonType:"prepend"},u.a.createElement(m.J,null,u.a.createElement("i",{className:"fa fa-credit-card"}))),u.a.createElement(d.b,{mask:[/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/],Component:d.a,className:"form-control"})),u.a.createElement(m.F,{color:"muted"},"ex. 9999 9999 9999 9999"))))),u.a.createElement(m.t,{sm:12,md:6},u.a.createElement(m.i,null,u.a.createElement(m.n,null,u.a.createElement("i",{className:"icon-note"}),u.a.createElement("strong",null,"React-Select")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component"),u.a.createElement("div",{className:"card-header-actions"},u.a.createElement("a",{href:"https://github.com/JedWatson/react-select",rel:"noreferrer noopener",target:"_blank",className:"card-header-action"},u.a.createElement("small",{className:"text-muted"},"docs")))),u.a.createElement(m.j,null,u.a.createElement(p.a,{name:"form-field-name2",value:this.state.value,options:h,onChange:this.saveChanges,multi:!0}))),u.a.createElement(m.i,null,u.a.createElement(m.n,null,u.a.createElement("i",{className:"icon-calendar"}),u.a.createElement("strong",null,"React-Dates")," ",u.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component"),u.a.createElement("div",{className:"card-header-actions"},u.a.createElement("a",{href:"https://github.com/airbnb/react-dates",rel:"noreferrer noopener",target:"_blank",className:"card-header-action"},u.a.createElement("small",{className:"text-muted"},"docs")))),u.a.createElement(m.j,null,u.a.createElement(b.DateRangePicker,{startDate:this.state.startDate,startDateId:"startDate",endDate:this.state.endDate,endDateId:"endDate",onDatesChange:function(a){var l=a.startDate,t=a.endDate;return e.setState({startDate:l,endDate:t})},focusedInput:this.state.focusedInput,onFocusChange:function(a){return e.setState({focusedInput:a})},orientation:this.state.orientation,openDirection:this.state.openDirection}))))))}}]),a}(u.a.Component);a.default=N},965:function(e,a,l){},967:function(e,a){a.AU=[{value:"australian-capital-territory",label:"Australian Capital Territory",className:"State-ACT"},{value:"new-south-wales",label:"New South Wales",className:"State-NSW"},{value:"victoria",label:"Victoria",className:"State-Vic"},{value:"queensland",label:"Queensland",className:"State-Qld"},{value:"western-australia",label:"Western Australia",className:"State-WA"},{value:"south-australia",label:"South Australia",className:"State-SA"},{value:"tasmania",label:"Tasmania",className:"State-Tas"},{value:"northern-territory",label:"Northern Territory",className:"State-NT"}],a.US=[{value:"AL",label:"Alabama",disabled:!0},{value:"AK",label:"Alaska"},{value:"AS",label:"American Samoa"},{value:"AZ",label:"Arizona"},{value:"AR",label:"Arkansas"},{value:"CA",label:"California"},{value:"CO",label:"Colorado"},{value:"CT",label:"Connecticut"},{value:"DE",label:"Delaware"},{value:"DC",label:"District Of Columbia"},{value:"FM",label:"Federated States Of Micronesia"},{value:"FL",label:"Florida"},{value:"GA",label:"Georgia"},{value:"GU",label:"Guam"},{value:"HI",label:"Hawaii"},{value:"ID",label:"Idaho"},{value:"IL",label:"Illinois"},{value:"IN",label:"Indiana"},{value:"IA",label:"Iowa"},{value:"KS",label:"Kansas"},{value:"KY",label:"Kentucky"},{value:"LA",label:"Louisiana"},{value:"ME",label:"Maine"},{value:"MH",label:"Marshall Islands"},{value:"MD",label:"Maryland"},{value:"MA",label:"Massachusetts"},{value:"MI",label:"Michigan"},{value:"MN",label:"Minnesota"},{value:"MS",label:"Mississippi"},{value:"MO",label:"Missouri"},{value:"MT",label:"Montana"},{value:"NE",label:"Nebraska"},{value:"NV",label:"Nevada"},{value:"NH",label:"New Hampshire"},{value:"NJ",label:"New Jersey"},{value:"NM",label:"New Mexico"},{value:"NY",label:"New York"},{value:"NC",label:"North Carolina"},{value:"ND",label:"North Dakota"},{value:"MP",label:"Northern Mariana Islands"},{value:"OH",label:"Ohio"},{value:"OK",label:"Oklahoma"},{value:"OR",label:"Oregon"},{value:"PW",label:"Palau"},{value:"PA",label:"Pennsylvania"},{value:"PR",label:"Puerto Rico"},{value:"RI",label:"Rhode Island"},{value:"SC",label:"South Carolina"},{value:"SD",label:"South Dakota"},{value:"TN",label:"Tennessee"},{value:"TX",label:"Texas"},{value:"UT",label:"Utah"},{value:"VT",label:"Vermont"},{value:"VI",label:"Virgin Islands"},{value:"VA",label:"Virginia"},{value:"WA",label:"Washington"},{value:"WV",label:"West Virginia"},{value:"WI",label:"Wisconsin"},{value:"WY",label:"Wyoming"}]}}]);
//# sourceMappingURL=23.4e82fa92.chunk.js.map