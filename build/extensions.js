(()=>{"use strict";var e={n:t=>{var n=t&&t.__esModule?()=>t.default:()=>t;return e.d(n,{a:n}),n},d:(t,n)=>{for(var a in n)e.o(n,a)&&!e.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:n[a]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.wp.element,n=window.React,a=window.wp.i18n,l=window.wp.components,i=window.wp.apiFetch;var r=e.n(i);const s=({plugin:e})=>{const{installing:i,activating:s,status:o,error:p,installPlugin:c,activatePlugin:u}=((e,t)=>{const[l,i]=(0,n.useState)(!1),[s,o]=(0,n.useState)(!1),[p,c]=(0,n.useState)(""),[u,w]=(0,n.useState)(""),g=(e,t="")=>{c(e),w(t)},m=async(n=t)=>{if(o(!0),g((0,a.__)("Activating...","wp-graphql")),!n){let t=new URL(e).pathname.split("/").filter(Boolean).pop();n=`${t}/${t}.php`}try{const t=await r()({path:`/wp/v2/plugins/${n}`,method:"PUT",data:{status:"active"},headers:{"X-WP-Nonce":wpgraphqlExtensions.nonce}});if("active"===t.status)return g((0,a.__)("Active","wp-graphql")),window.wpgraphqlExtensions.extensions=window.wpgraphqlExtensions.extensions.map((t=>t.plugin_url===e?{...t,installed:!0,active:!0}:t)),!0;throw t.message.includes("Plugin file does not exist")?new Error((0,a.__)("Plugin file does not exist","wp-graphql")):new Error((0,a.__)("Activation failed","wp-graphql"))}catch(e){throw g((0,a.__)("Activation failed","wp-graphql"),e.message||(0,a.__)("Activation failed","wp-graphql")),e}finally{i(!1),o(!1)}};return{installing:l,activating:s,status:p,error:u,installPlugin:async()=>{i(!0),g((0,a.__)("Installing...","wp-graphql"));let n=new URL(e).pathname.split("/").filter(Boolean).pop();try{if("inactive"!==(await r()({path:"/wp/v2/plugins",method:"POST",data:{slug:n,status:"inactive"},headers:{"X-WP-Nonce":wpgraphqlExtensions.nonce}})).status)throw new Error((0,a.__)("Installation failed","wp-graphql"));await m(t)}catch(e){if(!e.message.includes("destination folder already exists"))throw g((0,a.__)("Installation failed","wp-graphql"),e.message||(0,a.__)("Installation failed","wp-graphql")),i(!1),e;await m(t)}},activatePlugin:m}})(e.plugin_url,e.plugin_path),[w,g]=(0,t.useState)(e.installed),[m,d]=(0,t.useState)(e.active),[h,_]=(0,t.useState)(!0);(0,t.useEffect)((()=>{g(e.installed),d(e.active)}),[e]);const E=new URL(e.plugin_url).host,{buttonText:b,buttonDisabled:f}=((e,t,n,l,i,r,s)=>{let o,p=!1,c=null;const u=e=>()=>window.open(e,"_blank");if(i)o=(0,a.__)("Installing...","wp-graphql"),p=!0;else if(r)o=(0,a.__)("Activating...","wp-graphql"),p=!0;else if(l)o=(0,a.__)("Active","wp-graphql"),p=!0;else if(n)o=(0,a.__)("Activate","wp-graphql"),c=s;else{const e=new URL(t).hostname.toLowerCase();switch(!0){case/github\.com$/.test(e):o=(0,a.__)("View on GitHub","wp-graphql"),c=u(t);break;case/bitbucket\.org$/.test(e):o=(0,a.__)("View on Bitbucket","wp-graphql"),c=u(t);break;case/gitlab\.com$/.test(e):o=(0,a.__)("View on GitLab","wp-graphql"),c=u(t);break;case/wordpress\.org$/.test(e):o=(0,a.__)("Install & Activate","wp-graphql"),c=s;break;default:o=(0,a.__)("View Plugin","wp-graphql"),c=u(t)}}return{buttonText:o,buttonDisabled:p,buttonOnClick:c}})(0,e.plugin_url,w,m,i,s);return(0,n.createElement)("div",{className:"plugin-card"},(0,n.createElement)("div",{className:"plugin-card-top"},(0,n.createElement)("div",{className:"name column-name"},(0,n.createElement)("h2",null,e.name),(0,n.createElement)((({authors:e})=>e&&e.length?(0,n.createElement)(n.Fragment,null,(0,n.createElement)("em",null,"By "),e.map(((t,a)=>(0,n.createElement)("cite",{key:t.homepage},(0,n.createElement)("a",{href:t.homepage,target:"_blank",rel:"noopener noreferrer"},t.name),a<e.length-1&&", ")))):null),{authors:e.authors}),e.experiment&&(0,n.createElement)("em",{className:"plugin-experimental"},"(experimental)")),(0,n.createElement)("div",{className:"action-links"},(0,n.createElement)("ul",{className:"plugin-action-buttons"},E.includes("wordpress.org")&&(0,n.createElement)("li",null,(0,n.createElement)("button",{type:"button",className:"button "+(m?"button-disabled":"button-primary"),disabled:f,onClick:async()=>{const t=w,n=m;try{w?(await u(e.plugin_path),d(!0)):(await c(),g(!0),d(!0))}catch(e){g(t),d(n)}finally{window.wpgraphqlExtensions.extensions=window.wpgraphqlExtensions.extensions.map((t=>t.plugin_url===e.plugin_url?{...t,installed:w,active:m}:t))}}},b,(i||s)&&(0,n.createElement)(l.Spinner,null))),E.includes("github.com")&&(0,n.createElement)("li",null,(0,n.createElement)("a",{href:e.plugin_url,target:"_blank",rel:"noopener noreferrer",className:"button button-secondary"},(0,a.__)("View on GitHub","wp-graphql"))),e.support_url&&(0,n.createElement)("li",null,(0,n.createElement)("a",{href:e.support_url,target:"_blank",rel:"noopener noreferrer",className:"thickbox open-plugin-details-modal"},(0,a.__)("Get Support","wp-graphql"))),e.settings_url&&(0,n.createElement)("li",null,(0,n.createElement)("a",{href:e.settings_url},(0,a.__)("Settings","wp-graphql"))))),(0,n.createElement)("div",{className:"desc column-description"},(0,n.createElement)("p",null,e.description))),p&&h&&(0,n.createElement)(l.Notice,{status:"error",isDismissible:!0,onRemove:()=>_(!1)},p))},o=()=>{const[e,t]=(0,n.useState)([]);return(0,n.useEffect)((()=>{window.wpgraphqlExtensions&&window.wpgraphqlExtensions.extensions&&t(window.wpgraphqlExtensions.extensions)}),[]),(0,n.createElement)("div",{className:"wp-clearfix"},(0,n.createElement)("div",{className:"plugin-cards"},e.map((e=>(0,n.createElement)(s,{key:e.plugin_url,plugin:e})))))};document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("wpgraphql-extensions");e&&(0,t.createRoot)(e).render((0,t.createElement)(o))}))})();