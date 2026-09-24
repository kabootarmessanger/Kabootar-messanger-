"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[175],{7175:function(e,t,a){let n,i,r,o;a.r(t),a.d(t,{getAnalytics:function(){return eD},getGoogleAnalyticsClientId:function(){return eM},initializeAnalytics:function(){return eP},isSupported:function(){return eq},logEvent:function(){return eO},setAnalyticsCollectionEnabled:function(){return eN},setConsent:function(){return e_},setCurrentScreen:function(){return eF},setDefaultEventParameters:function(){return ez},setUserId:function(){return ex},setUserProperties:function(){return eE},settings:function(){return ej}});var s=a(8885),l=a(9053),c=a(3943),u=a(2680),d=a(6512);let f="@firebase/installations",p="0.6.9",h=`w:${p}`,g="FIS_v2",m=new c.LL("installations","Installations",{"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."});function w(e){return e instanceof c.ZR&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y({projectId:e}){return`https://firebaseinstallations.googleapis.com/v1/projects/${e}/installations`}function v(e){return{token:e.token,requestStatus:2,expiresIn:Number(e.expiresIn.replace("s","000")),creationTime:Date.now()}}async function b(e,t){let a=(await t.json()).error;return m.create("request-failed",{requestName:e,serverCode:a.code,serverMessage:a.message,serverStatus:a.status})}function I({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}async function T(e){let t=await e();return t.status>=500&&t.status<600?e():t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k({appConfig:e,heartbeatServiceProvider:t},{fid:a}){let n=y(e),i=I(e),r=t.getImmediate({optional:!0});if(r){let e=await r.getHeartbeatsHeader();e&&i.append("x-firebase-client",e)}let o={method:"POST",headers:i,body:JSON.stringify({fid:a,authVersion:g,appId:e.appId,sdkVersion:h})},s=await T(()=>fetch(n,o));if(s.ok){let e=await s.json();return{fid:e.fid||a,registrationStatus:2,refreshToken:e.refreshToken,authToken:v(e.authToken)}}throw await b("Create Installation",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let S=/^[cdef][\w-]{21}$/;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let A=new Map;function j(e,t){let a=$(e);D(a,t),function(e,t){let a=(!P&&"BroadcastChannel"in self&&((P=new BroadcastChannel("[Firebase] FID Change")).onmessage=e=>{D(e.data.key,e.data.fid)}),P);a&&a.postMessage({key:e,fid:t}),0===A.size&&P&&(P.close(),P=null)}(a,t)}function D(e,t){let a=A.get(e);if(a)for(let e of a)e(t)}let P=null,q="firebase-installations-store",F=null;function M(){return F||(F=(0,d.X3)("firebase-installations-database",1,{upgrade:(e,t)=>{0===t&&e.createObjectStore(q)}})),F}async function x(e,t){let a=$(e),n=(await M()).transaction(q,"readwrite"),i=n.objectStore(q),r=await i.get(a);return await i.put(t,a),await n.done,r&&r.fid===t.fid||j(e,t.fid),t}async function E(e){let t=$(e),a=(await M()).transaction(q,"readwrite");await a.objectStore(q).delete(t),await a.done}async function N(e,t){let a=$(e),n=(await M()).transaction(q,"readwrite"),i=n.objectStore(q),r=await i.get(a),o=t(r);return void 0===o?await i.delete(a):await i.put(o,a),await n.done,o&&(!r||r.fid!==o.fid)&&j(e,o.fid),o}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z(e){let t;let a=await N(e.appConfig,a=>{let n=function(e,t){if(0===t.registrationStatus){if(!navigator.onLine)return{installationEntry:t,registrationPromise:Promise.reject(m.create("app-offline"))};let a={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},n=O(e,a);return{installationEntry:a,registrationPromise:n}}return 1===t.registrationStatus?{installationEntry:t,registrationPromise:_(e)}:{installationEntry:t}}(e,K(a||{fid:function(){try{let e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;let t=btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_").substr(0,22);return S.test(t)?t:""}catch(e){return""}}(),registrationStatus:0}));return t=n.registrationPromise,n.installationEntry});return""===a.fid?{installationEntry:await t}:{installationEntry:a,registrationPromise:t}}async function O(e,t){try{let a=await k(e,t);return x(e.appConfig,a)}catch(a){throw w(a)&&409===a.customData.serverCode?await E(e.appConfig):await x(e.appConfig,{fid:t.fid,registrationStatus:0}),a}}async function _(e){let t=await L(e.appConfig);for(;1===t.registrationStatus;)await C(100),t=await L(e.appConfig);if(0===t.registrationStatus){let{installationEntry:t,registrationPromise:a}=await z(e);return a||t}return t}function L(e){return N(e,e=>{if(!e)throw m.create("installation-not-found");return K(e)})}function K(e){return 1===e.registrationStatus&&e.registrationTime+1e4<Date.now()?{fid:e.fid,registrationStatus:0}:e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U({appConfig:e,heartbeatServiceProvider:t},a){let n=function(e,{fid:t}){return`${y(e)}/${t}/authTokens:generate`}(e,a),i=function(e,{refreshToken:t}){let a=I(e);return a.append("Authorization",`${g} ${t}`),a}(e,a),r=t.getImmediate({optional:!0});if(r){let e=await r.getHeartbeatsHeader();e&&i.append("x-firebase-client",e)}let o={method:"POST",headers:i,body:JSON.stringify({installation:{sdkVersion:h,appId:e.appId}})},s=await T(()=>fetch(n,o));if(s.ok)return v(await s.json());throw await b("Generate Auth Token",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function R(e,t=!1){let a;let n=await N(e.appConfig,n=>{var i;if(!V(n))throw m.create("not-registered");let r=n.authToken;if(!t&&2===(i=r).requestStatus&&!function(e){let t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+36e5}(i))return n;if(1===r.requestStatus)return a=X(e,t),n;{if(!navigator.onLine)throw m.create("app-offline");let t=function(e){let t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}(n);return a=H(e,t),t}});return a?await a:n.authToken}async function X(e,t){let a=await B(e.appConfig);for(;1===a.authToken.requestStatus;)await C(100),a=await B(e.appConfig);let n=a.authToken;return 0===n.requestStatus?R(e,t):n}function B(e){return N(e,e=>{var t;if(!V(e))throw m.create("not-registered");return 1===(t=e.authToken).requestStatus&&t.requestTime+1e4<Date.now()?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function H(e,t){try{let a=await U(e,t),n=Object.assign(Object.assign({},t),{authToken:a});return await x(e.appConfig,n),a}catch(a){if(w(a)&&(401===a.customData.serverCode||404===a.customData.serverCode))await E(e.appConfig);else{let a=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await x(e.appConfig,a)}throw a}}function V(e){return void 0!==e&&2===e.registrationStatus}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function G(e){let{installationEntry:t,registrationPromise:a}=await z(e);return a?a.catch(console.error):R(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function W(e,t=!1){return await Z(e),(await R(e,t)).token}async function Z(e){let{registrationPromise:t}=await z(e);t&&await t}function J(e){return m.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Y="installations";(0,s.Xd)(new u.wA(Y,e=>{let t=e.getProvider("app").getImmediate(),a=/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if(!e||!e.options)throw J("App Configuration");if(!e.name)throw J("App Name");for(let t of["projectId","apiKey","appId"])if(!e.options[t])throw J(t);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}(t),n=(0,s.qX)(t,"heartbeat");return{app:t,appConfig:a,heartbeatServiceProvider:n,_delete:()=>Promise.resolve()}},"PUBLIC")),(0,s.Xd)(new u.wA("installations-internal",e=>{let t=e.getProvider("app").getImmediate(),a=(0,s.qX)(t,Y).getImmediate();return{getId:()=>G(a),getToken:e=>W(a,e)}},"PRIVATE")),(0,s.KN)(f,p),(0,s.KN)(f,p,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Q="analytics",ee="https://www.googletagmanager.com/gtag/js",et=new l.Yd("@firebase/analytics"),ea=new c.LL("analytics","Analytics",{"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."});/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function en(e){if(!e.startsWith(ee)){let t=ea.create("invalid-gtag-resource",{gtagURL:e});return et.warn(t.message),""}return e}function ei(e){return Promise.all(e.map(e=>e.catch(e=>e)))}async function er(e,t,a,n,i,r){let o=n[i];try{if(o)await t[o];else{let e=(await ei(a)).find(e=>e.measurementId===i);e&&await t[e.appId]}}catch(e){et.error(e)}e("config",i,r)}async function eo(e,t,a,n,i){try{let r=[];if(i&&i.send_to){let e=i.send_to;Array.isArray(e)||(e=[e]);let n=await ei(a);for(let a of e){let e=n.find(e=>e.measurementId===a),i=e&&t[e.appId];if(i)r.push(i);else{r=[];break}}}0===r.length&&(r=Object.values(t)),await Promise.all(r),e("event",n,i||{})}catch(e){et.error(e)}}class es{constructor(e={},t=1e3){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}let el=new es;async function ec(e){var t;let{appId:a,apiKey:n}=e,i={method:"GET",headers:new Headers({Accept:"application/json","x-goog-api-key":n})},r="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig".replace("{app-id}",a),o=await fetch(r,i);if(200!==o.status&&304!==o.status){let e="";try{let a=await o.json();(null===(t=a.error)||void 0===t?void 0:t.message)&&(e=a.error.message)}catch(e){}throw ea.create("config-fetch-failed",{httpStatus:o.status,responseMessage:e})}return o.json()}async function eu(e,t=el,a){let{appId:n,apiKey:i,measurementId:r}=e.options;if(!n)throw ea.create("no-app-id");if(!i){if(r)return{measurementId:r,appId:n};throw ea.create("no-api-key")}let o=t.getThrottleMetadata(n)||{backoffCount:0,throttleEndTimeMillis:Date.now()},s=new ef;return setTimeout(async()=>{s.abort()},void 0!==a?a:6e4),ed({appId:n,apiKey:i,measurementId:r},o,s,t)}async function ed(e,{throttleEndTimeMillis:t,backoffCount:a},n,i=el){var r;let{appId:o,measurementId:s}=e;try{await new Promise((e,a)=>{let i=setTimeout(e,Math.max(t-Date.now(),0));n.addEventListener(()=>{clearTimeout(i),a(ea.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}catch(e){if(s)return et.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${s} provided in the "measurementId" field in the local Firebase config. [${null==e?void 0:e.message}]`),{appId:o,measurementId:s};throw e}try{let t=await ec(e);return i.deleteThrottleMetadata(o),t}catch(u){if(!function(e){if(!(e instanceof c.ZR)||!e.customData)return!1;let t=Number(e.customData.httpStatus);return 429===t||500===t||503===t||504===t}(u)){if(i.deleteThrottleMetadata(o),s)return et.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${s} provided in the "measurementId" field in the local Firebase config. [${null==u?void 0:u.message}]`),{appId:o,measurementId:s};throw u}let t=503===Number(null===(r=null==u?void 0:u.customData)||void 0===r?void 0:r.httpStatus)?(0,c.$s)(a,i.intervalMillis,30):(0,c.$s)(a,i.intervalMillis),l={throttleEndTimeMillis:Date.now()+t,backoffCount:a+1};return i.setThrottleMetadata(o,l),et.debug(`Calling attemptFetch again in ${t} millis`),ed(e,l,n,i)}}class ef{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function ep(e,t,a,n,i){if(i&&i.global){e("event",a,n);return}{let i=await t;e("event",a,Object.assign(Object.assign({},n),{send_to:i}))}}async function eh(e,t,a,n){if(n&&n.global)return e("set",{screen_name:a}),Promise.resolve();e("config",await t,{update:!0,screen_name:a})}async function eg(e,t,a,n){if(n&&n.global)return e("set",{user_id:a}),Promise.resolve();e("config",await t,{update:!0,user_id:a})}async function em(e,t,a,n){if(n&&n.global){let t={};for(let e of Object.keys(a))t[`user_properties.${e}`]=a[e];return e("set",t),Promise.resolve()}e("config",await t,{update:!0,user_properties:a})}async function ew(e,t){let a=await t;return new Promise((t,n)=>{e("get",a,"client_id",e=>{e||n(ea.create("no-client-id")),t(e)})})}async function ey(e,t){let a=await e;window[`ga-disable-${a}`]=!t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ev(){if(!(0,c.hl)())return et.warn(ea.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;try{await (0,c.eu)()}catch(e){return et.warn(ea.create("indexeddb-unavailable",{errorInfo:null==e?void 0:e.toString()}).message),!1}return!0}async function eb(e,t,a,r,o,s,l){var c;let u=eu(e);u.then(t=>{a[t.measurementId]=t.appId,e.options.measurementId&&t.measurementId!==e.options.measurementId&&et.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${t.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(e=>et.error(e)),t.push(u);let d=ev().then(e=>e?r.getId():void 0),[f,p]=await Promise.all([u,d]);!function(e){for(let t of Object.values(window.document.getElementsByTagName("script")))if(t.src&&t.src.includes(ee)&&t.src.includes(e))return t;return null}(s)&&function(e,t){var a,n;let i;let r=(a="firebase-js-sdk-policy",n={createScriptURL:en},window.trustedTypes&&(i=window.trustedTypes.createPolicy(a,n)),i),o=document.createElement("script"),s=`${ee}?l=${e}&id=${t}`;o.src=r?null==r?void 0:r.createScriptURL(s):s,o.async=!0,document.head.appendChild(o)}(s,f.measurementId),i&&(o("consent","default",i),i=void 0),o("js",new Date);let h=null!==(c=null==l?void 0:l.config)&&void 0!==c?c:{};return h.origin="firebase",h.update=!0,null!=p&&(h.firebase_id=p),o("config",f.measurementId,h),n&&(o("set",n),n=void 0),f.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eI{constructor(e){this.app=e}_delete(){return delete eT[this.app.options.appId],Promise.resolve()}}let eT={},ek=[],eC={},eS="dataLayer",e$="gtag",eA=!1;function ej(e){if(eA)throw ea.create("already-initialized");e.dataLayerName&&(eS=e.dataLayerName),e.gtagName&&(e$=e.gtagName)}function eD(e=(0,s.Mq)()){e=(0,c.m9)(e);let t=(0,s.qX)(e,Q);return t.isInitialized()?t.getImmediate():eP(e)}function eP(e,t={}){let a=(0,s.qX)(e,Q);if(a.isInitialized()){let e=a.getImmediate();if((0,c.vZ)(t,a.getOptions()))return e;throw ea.create("already-initialized")}return a.initialize({options:t})}async function eq(){if((0,c.ru)()||!(0,c.zI)()||!(0,c.hl)())return!1;try{return await (0,c.eu)()}catch(e){return!1}}function eF(e,t,a){e=(0,c.m9)(e),eh(o,eT[e.app.options.appId],t,a).catch(e=>et.error(e))}async function eM(e){return e=(0,c.m9)(e),ew(o,eT[e.app.options.appId])}function ex(e,t,a){e=(0,c.m9)(e),eg(o,eT[e.app.options.appId],t,a).catch(e=>et.error(e))}function eE(e,t,a){e=(0,c.m9)(e),em(o,eT[e.app.options.appId],t,a).catch(e=>et.error(e))}function eN(e,t){ey(eT[(e=(0,c.m9)(e)).app.options.appId],t).catch(e=>et.error(e))}function ez(e){o?o("set",e):n=e}function eO(e,t,a,n){e=(0,c.m9)(e),ep(o,eT[e.app.options.appId],t,a,n).catch(e=>et.error(e))}function e_(e){o?o("consent","update",e):i=e}let eL="@firebase/analytics",eK="0.10.8";(0,s.Xd)(new u.wA(Q,(e,{options:t})=>(function(e,t,a){!function(){let e=[];if((0,c.ru)()&&e.push("This is a browser extension environment."),(0,c.zI)()||e.push("Cookies are not available."),e.length>0){let t=e.map((e,t)=>`(${t+1}) ${e}`).join(" "),a=ea.create("invalid-analytics-context",{errorInfo:t});et.warn(a.message)}}();let n=e.options.appId;if(!n)throw ea.create("no-app-id");if(!e.options.apiKey){if(e.options.measurementId)et.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw ea.create("no-api-key")}if(null!=eT[n])throw ea.create("already-exists",{id:n});if(!eA){var i,s,l,u;let e,t;i=eS,e=[],Array.isArray(window[i])?e=window[i]:window[i]=e;let{wrappedGtag:a,gtagCore:n}=(s=eS,l=e$,t=function(...e){window[s].push(arguments)},window[l]&&"function"==typeof window[l]&&(t=window[l]),window[l]=(u=t,async function(e,...t){try{if("event"===e){let[e,a]=t;await eo(u,eT,ek,e,a)}else if("config"===e){let[e,a]=t;await er(u,eT,ek,eC,e,a)}else if("consent"===e){let[e,a]=t;u("consent",e,a)}else if("get"===e){let[e,a,n]=t;u("get",e,a,n)}else if("set"===e){let[e]=t;u("set",e)}else u(e,...t)}catch(e){et.error(e)}}),{gtagCore:t,wrappedGtag:window[l]});o=a,r=n,eA=!0}return eT[n]=eb(e,ek,eC,t,r,eS,a),new eI(e)})(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),t),"PUBLIC")),(0,s.Xd)(new u.wA("analytics-internal",function(e){try{let t=e.getProvider(Q).getImmediate();return{logEvent:(e,a,n)=>eO(t,e,a,n)}}catch(e){throw ea.create("interop-component-reg-failed",{reason:e})}},"PRIVATE")),(0,s.KN)(eL,eK),(0,s.KN)(eL,eK,"esm2017")}}]);