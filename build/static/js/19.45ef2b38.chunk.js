(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{1431:function(e,t,n){"use strict";n.r(t);var a=n(68),r=n(69),s=n(71),i=n(70),o=n(72),c=n(1),l=n.n(c),d=n(4),m=n(1074),p=(n(500),n(1075),n(1077),n(1079),n(1081),n(1083),n(967),{markdown:"### [CodeMirror](http://codemirror.net)\nA versatile _text_ editor implemented in **JavaScript*** for the browser. \nIt is specialized for editing `code`, and comes with a number of language modes and addons that implement more advanced editing functionality.\n",javascript:'var component = {\n\tname: "react-codemirror2",\n\tauthor: "Salvatore Niro",\n\trepo: "https://github.com/scniro/react-codemirror2"\n};',xml:'<!DOCTYPE html>\n<html lang="en">\n<head>\n\n  <meta charset="utf-8"/>\n  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>\n  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>\n  <meta name="description" content=""/>\n  <meta name="author" content="\u0141ukasz Holeczek"/>\n  <meta name="keyword" content=""/>\n  <link rel="shortcut icon" href="img/favicon.png"/>\n\n  <title></title>\n\n  \x3c!-- Icons --\x3e\n  <link href="node_modules/font-awesome/css/font-awesome.min.css" rel="stylesheet"/>\n  <link href="node_modules/simple-line-icons/css/simple-line-icons.css" rel="stylesheet"/>\n\n  \x3c!-- Main styles for this application --\x3e\n  <link href="css/style.css" rel="stylesheet"/>\n\n</head>\n\n\n<body class="app header-fixed sidebar-fixed aside-menu-fixed aside-menu-hidden">\n  <header class="app-header navbar">\n  <h1>I \u2665 react-codemirror2</h1>\n  ...\n</header>\n  <div class="app-body">\n    <div class="sidebar">\n      ...\n    </div>\n    \x3c!-- Main content --\x3e\n    <main class="main">\n\n    </main>\n    <aside class="aside-menu">\n      ...\n    </aside>\n  </div>\n  <footer class="app-footer">\n    ...\n  </footer>\n\n  \x3c!-- Bootstrap and necessary plugins --\x3e\n  <script src="node_modules/jquery/dist/jquery.min.js"><\/script>\n  <script src="node_modules/popper.js/dist/umd/popper.min.js"><\/script>\n  <script src="node_modules/bootstrap/dist/js/bootstrap.min.js"><\/script>\n  <script src="node_modules/pace-progress/pace.min.js"><\/script>\n\n  \x3c!-- Plugins and scripts required by all views --\x3e\n  <script src="node_modules/chart.js/dist/Chart.min.js"><\/script>\n\n  \x3c!-- Main scripts --\x3e\n  <script src="js/app-config.js"><\/script>\n  <script src="js/app.js"><\/script>\n\n</body>\n</html>'}),h=function(e){function t(e){var n;return Object(a.a)(this,t),(n=Object(s.a)(this,Object(i.a)(t).call(this,e))).state={readOnly:!1,theme:"eclipse",mode:"markdown",code:p.markdown},n}return Object(o.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){this.setState({mode:"xml",code:p.xml}),this.editor.editor.options.autofocus&&(this.editor.editor.setSize("100%","50vh"),this.editor.editor.focus())}},{key:"render",value:function(){var e=this,t={lineNumbers:!0,readOnly:this.state.readOnly,mode:this.state.mode,theme:this.state.theme,autofocus:!0};return l.a.createElement(d.i,null,l.a.createElement(d.n,null,"CodeMirror"," ",l.a.createElement("a",{href:"https://coreui.io/pro/react/",className:"badge badge-danger"},"CoreUI Pro Component"),l.a.createElement("div",{className:"card-header-actions"},l.a.createElement("a",{href:"https://github.com/scniro/react-codemirror2",rel:"noopener noreferrer",target:"_blank",className:"card-header-action"},l.a.createElement("small",{className:"text-muted"},"docs")))),l.a.createElement(d.j,null,l.a.createElement(m.UnControlled,{ref:function(t){return e.editor=t},value:this.state.code,options:t,onBeforeChange:function(t,n,a){e.setState({value:a})},onChange:function(e,t,n){}})),l.a.createElement(d.l,null,l.a.createElement(d.C,{inline:!0},l.a.createElement(d.E,null,l.a.createElement(d.G,{type:"select",bsSize:"sm",name:"theme",id:"theme",onChange:function(t){return e.changeTheme(t)},value:this.state.theme},l.a.createElement("option",{value:"material"},"material"),l.a.createElement("option",{value:"eclipse"},"eclipse"))),l.a.createElement(d.E,null,l.a.createElement(d.G,{type:"select",bsSize:"sm",name:"mode",id:"mode",onChange:function(t){return e.changeMode(t)},value:this.state.mode},l.a.createElement("option",{value:"markdown"},"markdown"),l.a.createElement("option",{value:"javascript"},"javascript"),l.a.createElement("option",{value:"xml"},"html"))))))}},{key:"changeMode",value:function(e){var t=e.target.value;this.setState({mode:t,code:p[t]}),this.editor.editor.focus()}},{key:"changeTheme",value:function(e){var t=e.target.value;this.setState({theme:t})}},{key:"toggleReadOnly",value:function(){var e=this;this.setState({readOnly:!this.state.readOnly},function(){e.editor.editor.focus()})}}]),t}(c.Component);t.default=h}}]);
//# sourceMappingURL=19.45ef2b38.chunk.js.map