import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
//引入swiper样式
import "swiper/css/swiper.css";


import api from "./api/api.js";
Vue.prototype.$api = api;

Vue.config.productionTip = false;


//全局的方法

//获取元素样式的函数
Vue.prototype.getStyle = function(ele,styleName){
  if(ele.currentStyle){
    return ele.currentStyle[styleName];
  }else{
    return getComputedStyle(ele,null)[styleName];
  }
}

//为li添加一个炫酷的点击效果
Vue.prototype.spread = function(ele,callBack){
  ele.flag = false;
  ele.addEventListener("touchstart",(ev)=>{
    ele.flag = true;
    ev = ev || window.event;
    let li = ev.currentTarget;
    let timerout = setTimeout(() => {
      clearTimeout(timerout);
      if(ele.flag){
        //给li中插入一个div
        let div = document.createElement("div");
        div.className = 'spread';
        li.appendChild(div);
        //开启一个定时器使插入的元素逐渐变大并透明
        let [width,opacity] = [200,.6];
        //获取当前页面的宽度
        let maxWidth = window.innerWidth;
        let timer = setInterval(()=>{
          width+=20;
          if(width>maxWidth+20){
            clearInterval(timer);
            div.remove();
          }
          opacity-=.02;
          div.style.width = width + 'px';
          div.style.height = width + 'px';
          div.style.transform = "translateX("+(-width/2)+"px) translateY("+(-width/2)+"px)";
          div.style.opacity = opacity;
        },1000/60)
      }
    }, 150);
  })
  ele.addEventListener('touchmove',()=>{
    ele.flag = false;
  })
  ele.addEventListener('touchend',(ev)=>{
    ev = ev || window.event;
    if (ele.flag) {
      callBack && callBack(ev);
    }
  })
}

//为元素添加点击事件的函数
Vue.prototype.clickEle = function(ele, callBack) {
  ele.flag = false;
  ele.addEventListener("touchstart", () => {
    ele.flag = true;
  });
  ele.addEventListener("touchmove", () => {
    ele.flag = false;
  });
  ele.addEventListener("touchend", (ev) => {
    ev = ev || window.event;
    if (ele.flag) {
      callBack && callBack(ev);
    }
  });
}

new Vue({
  router,
  store,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");
